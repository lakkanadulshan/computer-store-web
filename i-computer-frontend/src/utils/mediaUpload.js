import { createClient } from "@supabase/supabase-js";

const url = "https://geyffoqwtguavydvgqee.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdleWZmb3F3dGd1YXZ5ZHZncWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NDQyNDUsImV4cCI6MjA5MDQyMDI0NX0.bLoIvSJQIo10zcxb3dZyYd8ZgKDrRyh9JcM6BD8y130";

const supabase = createClient(url, key);

export async function uploadFile(file) {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now()
        const fileName = `${timestamp}_${file.name}`

        supabase.storage
            .from("images")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            })
            .then(() => {
                const publicUrl = supabase.storage.from("images").getPublicUrl(fileName).data.publicUrl
                resolve(publicUrl)
            })
            .catch((err) => {
                if (err?.status === 409 || err?.statusCode === "409") {
                    reject(new Error("File with this name already exists"))
                    return
                }
                reject(err)
            })
    })
}
