interface MatchButtonsProps {
    onLike: () => void;
    onPass: () => void;
    disabled?: boolean; // Thêm prop disabled để chặn click khi đang load
}

export default function MatchButtons({ onLike, onPass, disabled = false }: MatchButtonsProps) {
    return (
        <div className="flex items-center justify-center gap-8 py-4">
            {/* Nút Bỏ qua (Pass) */}
            <button
                onClick={onPass}
                disabled={disabled}
                className="group relative w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Pass"
            >
                <svg
                    className="w-8 h-8 text-red-500 transition-transform group-hover:-rotate-12"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {/* Nút Thích (Like) */}
            <button
                onClick={onLike}
                disabled={disabled}
                className="group relative w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Like"
            >
                <svg
                    className="w-8 h-8 text-green-500 transition-transform group-hover:scale-110"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                    />
                </svg>
                {/* Hiệu ứng tim bay lên khi hover (Optional CSS) */}
                <span className="absolute -top-10 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-500 text-2xl">
                    ❤️
                </span>
            </button>
        </div>
    );
}