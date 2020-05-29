# Upload middleware for Oak Deno framework

## Usage: 
<b>uploadMiddleware(</b>

<b>path</b>,

<b>extensions</b>: optional ex: ['jpg', 'png'], default allow all - [], 

<b>maxSizeBytes</b>: optional, total size in bytes for all files in form, default unlimited - Number.MAX_SAFE_INTEGER, 

<b>useCurrentDir</b>: optional, if true the path is relative to current Deno working directory, default true

<b>)</b>, next middlewares ...

Ex: 
```
.post("/upload", uploadMiddleware('uploads'), async (context: any, next: any) => { ...
.post("/upload", uploadMiddleware('uploads', ['jpg','png'], 20000000, true), async (context: any, next: any) => { ...
```
Uploads will be in <b>context.uploadedFiles</b>;

This middleware automatically organizes uploads to avoid file system problems and create dirs if not exists, and optimizes ram usage when uploading large files using Deno standard libraries!

Request must contains a body with form with enctype="multipart/form-data", and inputs with type="file". For a while, it does not support input with multiple attribute, but you can work around this in javascript with something like this:
```
var f = new FormData();
var name = document.querySelector("#yourform input[multiple]").getAttribute('name');
var files = document.querySelector("#yourform input[multiple]").files
.. in loop:
f.append('name'+i, files[i]);
send f with ajax..
```
## Examples:
```
import { uploadMiddleware } from "https://deno.land/x/upload_middleware_for_oak_framework/mod.ts";

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
		"url":"uploads/2020/4/4/20/0/28/1350065e-7053-429b-869b-08008a098b23/test.jpg",
		"uri":"C:\\Users\\Engenharia\\Documents\\base/uploads/2020/4/4/20/0/28/1350065e-7053-429b-869b-08008a098b23/test.jpg"
	},
	"file2":{
		"filename":"download.png",
		"type":"image/png",
		"size":2623,
		"url":"uploads/2020/4/4/20/0/28/46698b10-d319-4bbb-af64-fc8b2b991b54/download.png",
		"uri":"C:\\Users\\Engenharia\\Documents\\base/uploads/2020/4/4/20/0/28/46698b10-d319-4bbb-af64-fc8b2b991b54/download.png"
	}
}
```
If you want, you can delete a file sent using:
```
await Deno.remove(context.uploadedFiles['file2']['uri']});
```
Remember that you need permissions:
```
deno run --allow-net --allow-read --allow-write ./server.ts
```
