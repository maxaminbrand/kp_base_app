import { NavLink } from "@/types/main";
import Link from "next/link";

interface Props {
    links: NavLink[];
    base?: string;
}

export default function Sidebar({links, base}: Props) {
    return (
        <>
        {links.length > 0
            ? links.map(({label, href}) => (<Link key={label} href={base ? `${base}${href}` : href}>{label}</Link>))
            : 'SidarLinks'
        }
        </>
    );
}