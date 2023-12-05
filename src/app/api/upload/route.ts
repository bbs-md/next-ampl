import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from 'path'
import { S3} from 'aws-sdk'
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import config from '@/amplifyconfiguration.json';
import { myCustomQuery } from "@/graphql/queries";
import { myCustomMutation } from "@/graphql/mutations";
Amplify.configure(config);
const client = generateClient();

export async function POST(request: NextRequest) {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const name: string | null = data.get('name') as unknown as string
    console.log('POST name [', name, ']')
    if (!file) {
        return NextResponse.json({ success: false});
    }

    const apiData = await client.graphql({ query: myCustomMutation, variables: { 
        cvData: {
          bucketName: "bucketName-XXX-XXX",
          objectKey: "objectKey-YYY-YYYY",
          source: "alliedtesting.com"
        }
      }});
    console.log('graphql apiData >>> ', apiData)


    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const path = join('/', 'tmp', file.name)
    await writeFile(path, buffer)

    console.log(`open ${path} to see uploaded file`)

    const params = {
        Bucket: 'hr-ses-mail-received-tol',
        Key: file.name,
        Body: buffer,
    };
    console.log(params);

    const s3 = new S3({
        // accessKeyId: 'key-id-goes-here',
        // secretAccessKey: 'secret-access-key-goes-here',
        //region: 'eu-west-1',
    });

    try {
        const upload = s3.upload(params);
        //setUpload(upload);
        upload.on('httpUploadProgress', (p) => {
            console.log(p.loaded / p.total);
            //progress.set(p.loaded / p.total);
        });
        await upload.promise();
        console.log(`File uploaded successfully: ${file.name}`);
    } catch (err) {
        console.error('Failed to upload file to s3: ', err);
    }

    return NextResponse.json( {success: true})


}