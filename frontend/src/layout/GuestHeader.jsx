import React from 'react'
import { Outlet } from 'react-router-dom'

export default function GuestHeader() {
    return (
        <div>GuestHeader
            <Outlet />
        </div>
    )
}