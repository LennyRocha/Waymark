import React from 'react'
import { Outlet } from 'react-router-dom'

export default function AdminSidebar() {
    return (
        <div>AdminSidebar
            <Outlet />
        </div>
    )
}
