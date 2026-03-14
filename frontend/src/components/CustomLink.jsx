import { Link } from 'react-router-dom'

export default function CustomLink({ children, classN = "",  ...props }) {
    return (
        <Link {...props} className={`${classN} transition  duration-300 ease-in-out text-text-secondary hover:underline hover:text-secondary-500`} >{children}</Link>
    )
}
