import Link from "next/link";
import ThemeToggle from "./theme-toggle";

const NAV_LINKS = [
    { label: 'Home', href: '/'},
    { label: 'Dashboard', href: '/dashboard'},
    { label: 'Admin', href: '/admin'},
    { label: 'Forgot', href: '/forgot-password'},
    { label: 'Reset', href: '/reset-password'},
    { label: 'Login', href: '/login'},
]

export default function Header() {
    return (
        <div className="flex gap-1.5">
            {NAV_LINKS.map(({label, href}, idx) => <Link key={idx} href={href}>{label}</Link>)}
            <ThemeToggle />
        </div>
    );
}