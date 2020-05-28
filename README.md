# Upload middleware for Oak Deno framework

## Usage: 
<b>uploadMiddleware</b>(<b>path</b>, <b>extensions</b>: (optional ex: ['jpg', 'png'], default allow all - []), <b>maxSizeBytes</b>: (optional, max size in bytes, default unlimited - Number.MAX_SAFE_INTEGER), <b>useCurrentDir</b>: (optional, if true the path is relative to current Deno working directory, default true));

Uploads will be in context.uploadedFiles;

This middleware automatically organizes uploads to avoid file system problems and create dirs if not exists, and optimizes ram usage when uploading large files using Deno standard libraries!

Request must contains a body with form with enctype="multipart/form-data", and inputs with type="file". For a while, it does not support input with multiple attribute, but you can work around this in javascript by creating a virtual form and adding an input type="file" element for each "file" object in ("input[multiple]").files.
## Examples:
<p>import { uploadMiddleware } from &quot;https://deno.land/x/upload_middleware_for_oak_framework@master/mod.ts&quot;;</p>

<p> .get(&quot;/&quot;, async (context: any, next: any) => {  context.response.body = &#96;  form enctype=&quot;multipart/form-data&quot; action=&quot;/upload&quot; method=&quot;post&quot;  input type=&quot;file&quot; name=&quot;file1&quot;  input type=&quot;file&quot; name=&quot;file2&quot;  input type=&quot;submit&quot; value=&quot;Submit&quot;  form  &#96;;  })</p>

<p> .post(&quot;/upload&quot;, <b>uploadMiddleware('uploads', ['jpg','png'], 20000000, true)</b>,  async (context: any, next: any) => {  context.response.body = context.uploadedFiles;  },  )</p>

<p> This will return something like:  {  &quot;file1&quot;:{  &quot;filename&quot;:&quot;test.jpg&quot;,  &quot;type&quot;:&quot;image/jpeg&quot;,  &quot;size&quot;:16980,  &quot;url&quot;:&quot;uploads/2020/4/4/16/58/43/b16dfb0a-b8b9-4ed3-8c96-2e0a946101fb/test.jpg&quot;  },  &quot;file2&quot;:{  &quot;filename&quot;:&quot;download.png&quot;,  &quot;type&quot;:&quot;image/png&quot;,  &quot;size&quot;:2623,  &quot;url&quot;:&quot;uploads/2020/4/4/16/58/43/3a50bf12-6e40-4459-a0c0-52f913e1850e/download.png&quot;  } }</p>

If you want, you can delete a file sent using (if useCurrentDir = true):
	await Deno.remove(`${Deno.cwd()}/${context.uploadedFiles['file2']['url']}`);
Or possibly:
	await Deno.remove(context.uploadedFiles['file2']['url']});
Remember that you need permissions:
	deno run --allow-net --allow-read --allow-write ./server.ts
