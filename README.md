# Upload middleware for Oak Deno framework

## Usage: 
<b>uploadMiddleware</b>(<b>path</b>, <b>extensions</b>: (optional ex: ['jpg', 'png'], default allow all - []), <b>maxSizeBytes</b>: (optional, max size in bytes, default unlimited - Number.MAX_SAFE_INTEGER), <b>useCurrentDir</b>: (optional, if true the path is relative to current Deno working directory, default true));

Uploads will be in context.uploadedFiles;

This middleware automatically organizes uploads to avoid file system problems and create dirs if not exists, and optimizes ram usage when uploading large files using Deno standard libraries!

Request must contains a body with form with enctype="multipart/form-data", and inputs with type="file". For a while, it does not support input with multiple attribute, but you can work around this in javascript by creating a virtual form and adding an input type="file" element for each "file" object in ("input[multiple]").files.
## Examples:
<pre>
import { uploadMiddleware } from "https://deno.land/x/upload_middleware_for_oak_framework@master/mod.ts";

  .get("/", async (context: any, next: any) => {
    context.response.body = `
            form enctype="multipart/form-data" action="/upload" method="post"
              input type="file" name="file1"
              input type="file" name="file2"
              input type="submit" value="Submit"
            form
    `;
  })

  .post("/upload", <b>uploadMiddleware('uploads', ['jpg','png'], 20000000, true)</b>,
    async (context: any, next: any) => {
      context.response.body = context.uploadedFiles;
    },
  )

  This will return something like:
  {
	"file1":{
		"filename":"test.jpg",
		"type":"image/jpeg",
		"size":16980,
		"url":"uploads/2020/4/4/16/58/43/b16dfb0a-b8b9-4ed3-8c96-2e0a946101fb/test.jpg"
	},
	"file2":{
		"filename":"download.png",
		"type":"image/png",
		"size":2623,
		"url":"uploads/2020/4/4/16/58/43/3a50bf12-6e40-4459-a0c0-52f913e1850e/download.png"
	}
}

If you want, you can delete a file sent using (if useCurrentDir = true):
await Deno.remove(`${Deno.cwd()}/${context.uploadedFiles['file2']['url']}`);
Or possibly:
await Deno.remove(context.uploadedFiles['file2']['url']});
Remember that you need permissions:
deno run --allow-net --allow-read --allow-write ./server.ts
