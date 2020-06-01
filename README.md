# Upload middleware for Oak Deno framework
This middleware automatically organizes uploads to avoid file system problems and create dirs if not exists, perform validations and optimizes ram usage when uploading large files using Deno standard libraries!

## Usage: 
Ex: 
```javascript
.post("/upload", upload('uploads'), async (context: any, next: any) => { ...
.post("/upload", upload('uploads', ['jpg','png'], 20000000, 10000000, true), async (context: any, next: any) => { ...
```
<b>upload(</b>

<b>path</b>,

<b>extensions</b>: optional ex: ['jpg', 'png'], default allow all - [], 

<b>maxSizeBytes</b>: optional, max total size in bytes for all files in form, default unlimited - Number.MAX_SAFE_INTEGER, 

<b>maxFileSizeBytes</b>: optional, max size in bytes for each file in form, default unlimited - Number.MAX_SAFE_INTEGER, 

<b>useCurrentDir</b>: optional, if true the path is relative to current Deno working directory, default true

<b>)</b>, next middlewares ...

Uploads will be in <b>context.uploadedFiles</b>;

Request must contains a body with form type "multipart/form-data", and inputs with type="file". 

Ex: 
```javascript
.post("/pre_upload", preUploadValidate(["jpg", "png"], 20000000, 10000000), async (context: any, next: any) => { ...
```
<b>preUploadValidate(</b>

<b>extensions</b>: optional ex: ['jpg', 'png'], default allow all - [], 

<b>maxSizeBytes</b>: optional, max total size in bytes for all files in form, default unlimited - Number.MAX_SAFE_INTEGER, 

<b>maxFileSizeBytes</b>: optional, max size in bytes for each file in form, default unlimited - Number.MAX_SAFE_INTEGER

<b>)</b>, next middlewares ...

This middleware does a pre-validation before sending the form, for optimizations. To use it, send a JSON containing the objects "file". Use a different route than the upload route. Returns a validation message with all errors and status 422 (if there are errors).

## Examples:
Below an example to work with <b>AJAX</b>, also accepting type="file" <b>multiple</b> (until the next version of std, Deno's std works with only one input for each file, see: https://github.com/denoland/deno/pull/6027):
```javascript
var files = document.querySelector('#yourFormId input[type=file]').files
var name = document.querySelector('#yourFormId input[type=file]').getAttribute('name');

var form = new FormData();
for(var i=0;i<files.length;i++){
	form.append(`${name}_${i}`, files[i]);	
}
var res = await fetch('/upload', { //Fetch API automatically puts the form in the format "multipart/form-data".
	method: 'POST',
	body: form,
}).then(response=>response.json())
console.log(res)

//VALIDATIONS --------------

var validationData = {}
for(var i=0;i<files.length;i++){
	var newObj = { //newObj is needed, JSON.stringify(files[i]) not work
	   'name'             : files[i].name,
	   'size'             : files[i].size
	}; 
	validationData[`${name}_${i}`] = newObj;
}
var validations = await fetch('/pre_upload', {
	method: 'POST',
	headers: {'Content-Type': 'application/json'},
	body: JSON.stringify(validationData),
}).then(response=>response.json())
console.log(validations)
```
In Deno:
```javascript
import { upload, preUploadValidate} from "https://deno.land/x/upload_middleware_for_oak_framework/mod.ts";

  .post("/upload", upload('uploads', ['jpg','png'], 20000000, 10000000, true),
    async (context: any, next: any) => {
      context.response.body = context.uploadedFiles;
    },
  )
  .post("/pre_upload", preUploadValidate(["jpg", "png"], 20000000, 10000000),
    async (context: any, next: any) => {
      context.response.body = { msg: "Pass upload validations." };
    },
  )
  .get("/", async (context: any, next: any) => {
    context.response.body = `
            <form id="yourFormId" enctype="multipart/form-data" action="/upload" method="post">
              <input type="file" name="file1" multiple><br>
              <input type="file" name="file2"><br>
              <input type="submit" value="Submit">
            </form>
    `;
  })
  //This will return something like:
{
	"file1_0":{
		"filename":"test.jpg",
		"type":"image/jpeg",
		"size":16980,
		"url":"uploads/2020/4/4/20/0/28/1350065e-7053-429b-869b-08008a098b23/test.jpg",
		"uri":"C:\\Users\\Engenharia\\Documents\\base/uploads/2020/4/4/20/0/28/1350065e-7053-429b-869b-08008a098b23/test.jpg"
	},
	"file1_1":{
		"filename":"download.png",
		"type":"image/png",
		"size":2623,
		"url":"uploads/2020/4/4/20/0/28/46698b10-d319-4bbb-af64-fc8b2b991b54/download.png",
		"uri":"C:\\Users\\Engenharia\\Documents\\base/uploads/2020/4/4/20/0/28/46698b10-d319-4bbb-af64-fc8b2b991b54/download.png"
	}
}
```
If you want, you can delete a file sent using:
```javascript
await Deno.remove(context.uploadedFiles['file2']['uri']});
```
Remember that you need permissions:
```
deno run --allow-net --allow-read --allow-write ./server.ts
```
