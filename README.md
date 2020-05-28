# Upload middleware for Oak Deno framework

## Usage: 
uploadMiddleware(path, extensions: (optional ex: [jpg, png]), maxSizeBytes: (optional, max size in bytes));
-path is relative to current Deno working directory folder.

Uploads will be in context['uploadedFiles'];

This middleware automatically organizes uploads to avoid file system problems and create dirs if not exists, and optimizes ram usage when uploading large files using Deno standard libraries!

## Examples:
  .get("/", async (context: any, next: any) => {\
    context.response.body = `
    <!DOCTYPE html>
      <html>
        <head>
            <title>Upload multiple files</title>
        </head>
        <body>
            <form enctype="multipart/form-data" action="/upload" method="post">
              <input type="file" name="file1"><br>
              <input type="file" name="file2"><br>
              <input type="submit" value="Submit">
            </form>
        </body>
      </html>
    `;
  })

  .post("/upload", uploadMiddleware('uploads',['jpg','png'],20000000),
    async (context: any, next: any) => {
      context.response.body = context['uploadedFiles'];
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
