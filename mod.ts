import { ensureDir, ensureDirSync, v4, move, MultipartReader, SEP, join } from "./deps.ts";

interface UploadOptions {
  extensions?: Array<string>;
  maxSizeBytes?: number;
  maxFileSizeBytes?: number;
  saveFile?: boolean;
  readFile?: boolean;
  useCurrentDir?: boolean;
  useDateTimeSubDir?: boolean;
}

const defaultUploadOptions: UploadOptions = {
  extensions: [],
  maxSizeBytes: Number.MAX_SAFE_INTEGER,
  maxFileSizeBytes: Number.MAX_SAFE_INTEGER,
  saveFile: true,
  readFile: false,
  useCurrentDir: true,
  useDateTimeSubDir: true,
}

const upload = function (
  path: string,
  options: UploadOptions = defaultUploadOptions
) {
  const mergedOptions = Object.assign({}, defaultUploadOptions, options);
  const { extensions, maxSizeBytes, maxFileSizeBytes, saveFile, readFile, useCurrentDir, useDateTimeSubDir } = mergedOptions;
  ensureDirSync(join(Deno.cwd(), 'temp_uploads'));
  return async (context: any, next: any) => {
    if (
      parseInt(context.request.headers.get("content-length")) > maxSizeBytes!
    ) {
      context.throw(
        422,
        `Maximum total upload size exceeded, size: ${
          context.request.headers.get("content-length")
        } bytes, maximum: ${maxSizeBytes} bytes. `,
      );
      await next();
    }
    const boundaryRegex = /^multipart\/form-data;\sboundary=(?<boundary>.*)$/;
    let match: RegExpMatchArray | null;
    if (
      context.request.headers.get("content-type") &&
      (match = context.request.headers.get("content-type")!.match(
        boundaryRegex,
      ))
    ) {
      const formBoundary: string = match.groups!.boundary;
      const mr = new MultipartReader(
        await context.request.body({ type: 'reader' }).value,
        formBoundary,
      );
      const form = await mr.readForm(0);
      let res: any = {};
      let entries: any = Array.from(form.entries());
      let validations = "";
      for (const item of entries) {
        let values: any = [].concat(item[1]);
        for (const val of values) {
          if (val.filename !== undefined) {
            if (extensions!.length > 0) {
              let ext = val.filename.split(".").pop();
              if (!extensions!.includes(ext)) {
                validations +=
                  `The file extension is not allowed (${ext} in ${val.filename}), allowed extensions: ${extensions}. `;
              }
            }
            if (val.size > maxFileSizeBytes!) {
              validations +=
                `Maximum file upload size exceeded, file: ${val.filename}, size: ${val.size} bytes, maximum: ${maxFileSizeBytes} bytes. `;
            }
          }
        }
      }
      if (validations != "") {
        await form.removeAll();
        context.throw(422, validations);
        await next();
      }
      for (const item of entries) {
        let formField: any = item[0];
        let filesData: any = [].concat(item[1]);
        for (const fileData of filesData) {
          if (fileData.tempfile !== undefined) {
            let resData = fileData;
            if (readFile) {
              resData["data"] = await Deno.readFile(resData["tempfile"]);
            }
            if (saveFile) {
              let uploadPath = path;
              let uuid = '';
              if (useDateTimeSubDir) {
                const d = new Date();
                uuid = join(
                  d.getFullYear().toString(),
                  (d.getMonth()+1).toString(),
                  d.getDate().toString(),
                  d.getHours().toString(),
                  d.getMinutes().toString(),
                  d.getSeconds().toString(),
                  v4.generate() //TODO improve to use of v5
                );
                uploadPath = join(path,uuid);
              };
              let fullPath = uploadPath;
              if (useCurrentDir) {
                fullPath = join(Deno.cwd(),fullPath);
              }
              await ensureDir(fullPath);
              await move(
                fileData.tempfile,
                join(fullPath,fileData.filename),
              );
              delete resData["tempfile"];
              resData["id"] = uuid.replace(/\\/g, "/");
              resData["url"] = encodeURI(
                join(uploadPath,fileData.filename).replace(/\\/g, "/"),
              );
              resData["uri"] = join(fullPath,fileData.filename);
            } else {
              let tempFileName = resData.tempfile.split(SEP).pop();
              let pathTempFile = join(Deno.cwd(),'temp_uploads',tempFileName)
              await move(
                resData.tempfile,
                pathTempFile,
              );
              resData.tempfile = pathTempFile;
            }
            if (res[formField] !== undefined) {
              if (Array.isArray(res[formField])) {
                res[formField].push(resData);
              } else {
                res[formField] = [res[formField], resData];
              }
            } else {
              res[formField] = resData;
            }
          }
        }
      }
      context["uploadedFiles"] = res;
    } else {
      context.throw(
        422,
        'Invalid upload data, request must contains a body with form "multipart/form-data", and inputs with type="file". ',
      );
    }
    await next();
  };
};
const preUploadValidate = function (
  extensions: Array<string> = [],
  maxSizeBytes: number = Number.MAX_SAFE_INTEGER,
  maxFileSizeBytes: number = Number.MAX_SAFE_INTEGER,
) {
  return async (context: any, next: any) => {
    let jsonData = await context.request.body();
    jsonData = jsonData["value"];
    let totalBytes = 0;
    let validations = "";
    for (const iName in jsonData) {
      let files: any = [].concat(jsonData[iName]);
      for (const file of files) {
        totalBytes += jsonData[iName].size;
        if (file.size > maxFileSizeBytes) {
          validations +=
            `Maximum file upload size exceeded, file: ${file.name}, size: ${file.size} bytes, maximum: ${maxFileSizeBytes} bytes. `;
        }
        if (!extensions.includes(file.name.split(".").pop())) {
          validations += `The file extension is not allowed (${
            file.name.split(".").pop()
          } in ${file.name}), allowed extensions: ${extensions}. `;
        }
      }
    }
    if (totalBytes > maxSizeBytes) {
      validations +=
        `Maximum total upload size exceeded, size: ${totalBytes} bytes, maximum: ${maxSizeBytes} bytes. `;
    }
    if (validations != "") {
      context.throw(422, validations);
    }
    await next();
  };
};
export { upload, preUploadValidate };
