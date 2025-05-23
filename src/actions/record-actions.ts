'use server';

import { revalidatePath } from "next/cache";
import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function revalidate() {
  revalidatePath('/projects');
}

export async function uploadFile (formData:any, projectId: string | undefined)  {
      const response = await fetchAuthed(`${apiUrl}/records/upload?project_id=${projectId}`, {
        method: 'POST',
        body: formData
      });

    if (!response.ok) {
    throw new Error('Failed to upload a file to aws ');
    }
    return await response.json()
  };



  export async function queryDocument(projectId: string, fileName: string) {
    try {
      const response = await fetchAuthedJson(`${apiUrl}/records/query-doc?project_id=${projectId}&filename=${fileName}`, {
        method: 'POST',
      });
      // if (!response.ok) {
      //   throw new Error('Failed to query document');
      // }
  
      return await response.json();
    } catch (error) {
      console.log('EROR', error)
    }
  }

  export async function saveRecord(formData: any, user_id: string ) {
    try {
      const response = await fetchAuthedJson(`${apiUrl}/records/save?user_id=${user_id}`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    
      // if (!response.ok) {
      //   throw new Error('Failed to save a record');
      // }
      return await response.json();
    } catch (error) {
      console.log(error)
    }
  }

export async function updateRecord(recordId: string | undefined , formData: any) {
   try {
    const response = await fetchAuthedJson(`${apiUrl}/records/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      throw new Error('Failed to update record');
    }
   } catch (error) {
     console.log(error)
   }
}

export async function deleteRecord(recordId: string) {
  try {
    const response = await fetchAuthedJson(`${apiUrl}/records/${recordId}`, {
      method: 'DELETE'
    });
  
    if (!response.ok) {
      throw new Error('Failed to delete a record');
    }
  } catch (error) {
    console.log(error)
  }
  }