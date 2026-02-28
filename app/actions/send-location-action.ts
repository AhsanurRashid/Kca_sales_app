"use server"

import { cookies } from "next/headers"

export interface ILocationPayload {
    lat: number
    lng: number
}

export async function sendLocationData(payload: ILocationPayload) {
    const loggedInUser = decodeURIComponent((await cookies()).get('full_name')?.value || 'Unknown User')
    const dataToSend = {
        ...payload,
        userName: loggedInUser
    }

    try {
        const response = await fetch('https://tracker.zam.asia/api/location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        })

        console.log('Location response:', response)

        if (!response.ok) {
            throw new Error(`Failed to send location data: ${response.statusText}`)
        }

        return { success: true }
    } catch (error) {
        console.error('Error sending location data:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}