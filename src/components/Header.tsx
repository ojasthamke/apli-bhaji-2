import { Link } from 'react-router-dom';

export default function Header() {
    return (
        <header className="bg-[#1A1A1A] p-4 flex justify-between items-center shadow-lg">
            <Link to="/" className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
                <span className="text-[#10b981]">🥬</span> APLI BHAJI
            </Link>
        </header>
    );
}
