import React from 'react'
import { Outlet } from 'react-router-dom'

export default function HostHeader() {
    return (
        <div>HostHeader
            <Outlet />
        </div>
    )
}
