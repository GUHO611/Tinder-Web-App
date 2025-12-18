interface MatchButtonsProps {
    onLike: () => void;
    onPass: () => void;
    disabled?: boolean;
    swipeDir?: string | null; // Nhận hướng vuốt từ component cha ('left' | 'right' | null)
}

export default function MatchButtons({
    onLike,
    onPass,
    disabled = false,
    swipeDir = null, // Mặc định là null (chưa vuốt)
}: MatchButtonsProps) {
    // Kiểm tra trạng thái active dựa trên hướng vuốt
    const isLikeActive = swipeDir === "right";
    const isPassActive = swipeDir === "left";

    return (
        <div className="flex items-center justify-center gap-6 py-4 pointer-events-auto">

            {/* --- NÚT BỎ QUA (PASS) --- */}
            <button
                onClick={onPass}
                disabled={disabled}
                className={`group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
          ${isPassActive
                        ? "bg-red-500 border-red-500 scale-110 shadow-red-500/50 shadow-lg" // Khi đang vuốt trái
                        : "bg-black/40 backdrop-blur-md border-2 border-red-500 hover:bg-red-500 hover:border-red-500 hover:scale-110 hover:shadow-lg" // Bình thường
                    }
        `}
                aria-label="Pass"
            >
                <svg
                    className={`w-8 h-8 transition-colors duration-300 ${isPassActive ? "text-white" : "text-red-500 group-hover:text-white"
                        }`}
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

            {/* --- NÚT THÍCH (LIKE) --- */}
            <button
                onClick={onLike}
                disabled={disabled}
                className={`group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden
          ${isLikeActive
                        ? "bg-green-500 border-green-500 scale-110 shadow-green-500/50 shadow-lg" // Khi đang vuốt phải
                        : "bg-black/40 backdrop-blur-md border-2 border-green-500 hover:bg-green-500 hover:border-green-500 hover:scale-110 hover:shadow-lg" // Bình thường
                    }
        `}
                aria-label="Like"
            >
                {/* Hiệu ứng lan tỏa từ bên trong (Ripple Effect giả lập bằng CSS) */}
                <span
                    className={`absolute inset-0 rounded-full bg-green-400 opacity-0 transition-all duration-500 ease-out
                ${isLikeActive ? "animate-ping opacity-30" : "group-hover:animate-ping group-hover:opacity-30"}
            `}
                ></span>

                <svg
                    className={`w-8 h-8 transition-colors duration-300 relative z-10 ${isLikeActive ? "text-white scale-110" : "text-green-500 group-hover:text-white"
                        }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
        </div>
    );
}