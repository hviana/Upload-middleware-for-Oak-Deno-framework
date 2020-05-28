# Upload middleware for Oak Deno framework

## Usage: 
<b>uploadMiddleware</b>(<b>path</b>, <b>extensions</b>: (optional ex: ['jpg', 'png'], default allow all - []), <b>maxSizeBytes</b>: (optional, max size in bytes, default unlimited - Number.MAX_SAFE_INTEGER), <b>useCurrentDir</b>: (optional, if true the path is relative to current Deno working directory, default true));

Uploads will be in context.uploadedFiles;

This middleware automatically organizes uploads to avoid file system problems and create dirs if not exists, and optimizes ram usage when uploading large files using Deno standard libraries!

Request must contains a body with form with enctype="multipart/form-data", and inputs with type="file". For a while, it does not support input with multiple attribute, but you can work around this in javascript by creating a virtual form and adding an input type="file" element for each "file" object in ("input[multiple]").files.
## Examples:
<p>import { uploadMiddleware } from &quot;https://deno.land/x/upload_middleware_for_oak_framework@master/mod.ts&quot;;</p>
<p><br></p>
<p>&nbsp; .get(&quot;/&quot;, async (context: any, next: any) =&gt; {</p>
<p>&nbsp; &nbsp; context.response.body = `</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; form enctype=&quot;multipart/form-data&quot; action=&quot;/upload&quot; method=&quot;post&quot;</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; input type=&quot;file&quot; name=&quot;file1&quot;</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; input type=&quot;file&quot; name=&quot;file2&quot;</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; input type=&quot;submit&quot; value=&quot;Submit&quot;</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; form</p>
<p>&nbsp; &nbsp; `;</p>
<p>&nbsp; })</p>
<p><br></p>
<p>&nbsp; .post(&quot;/upload&quot;, &lt;b&gt;uploadMiddleware(&#39;uploads&#39;, [&#39;jpg&#39;,&#39;png&#39;], 20000000, true)&lt;/b&gt;,</p>
<p>&nbsp; &nbsp; async (context: any, next: any) =&gt; {</p>
<p>&nbsp; &nbsp; &nbsp; context.response.body = context.uploadedFiles;</p>
<p>&nbsp; &nbsp; },</p>
<p>&nbsp; )</p>
<p><br></p>
<p>&nbsp; This will return something like:</p>
<p>&nbsp; {</p>
<p><span style="white-space:pre;">&nbsp; &nbsp;&nbsp;</span>&quot;file1&quot;:{</p>
<p><span style="white-space:pre;">&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span>&quot;filename&quot;:&quot;test.jpg&quot;,</p>
<p><span style="white-space:pre;">&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span>&quot;type&quot;:&quot;image/jpeg&quot;,</p>
<p><span style="white-space:pre;">&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span>&quot;size&quot;:16980,</p>
<p><span style="white-space:pre;">&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span>&quot;url&quot;:&quot;uploads/2020/4/4/16/58/43/b16dfb0a-b8b9-4ed3-8c96-2e0a946101fb/test.jpg&quot;</p>
<p><span style="white-space:pre;">&nbsp; &nbsp;&nbsp;</span>},</p>
<p><span style="white-space:pre;">&nbsp; &nbsp;&nbsp;</span>&quot;file2&quot;:{</p>
<p><span style="white-space:pre;">&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span>&quot;filename&quot;:&quot;download.png&quot;,</p>
<p><span style="white-space:pre;">&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span>&quot;type&quot;:&quot;image/png&quot;,</p>
<p><span style="white-space:pre;">&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span>&quot;size&quot;:2623,</p>
<p><span style="white-space:pre;">&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span>&quot;url&quot;:&quot;uploads/2020/4/4/16/58/43/3a50bf12-6e40-4459-a0c0-52f913e1850e/download.png&quot;</p>
<p><span style="white-space:pre;">&nbsp; &nbsp;&nbsp;</span>}</p>
<p>}</p>

If you want, you can delete a file sent using (if useCurrentDir = true):
<p>&nbsp;await Deno.remove(`${Deno.cwd()}/${context.uploadedFiles['file2']['url']}`);</p>
Or possibly:
<p>&nbsp;await Deno.remove(context.uploadedFiles['file2']['url']});</p>
Remember that you need permissions:
<p>&nbsp;deno run --allow-net --allow-read --allow-write ./server.ts</p>
