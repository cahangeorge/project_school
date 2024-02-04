type Message = {
    message: string | null | undefined,
    bgColor: string
}

export const Message = (
    { message, bgColor } : Message
) => {
    return (
        <div className={`
            ${message !== undefined && message !== null ? 'block' : 'hidden'}
            text-center text-white border-2 border-dotted border-white 
            rounded-3xl p-3 my-3 ${bgColor}
            w-full transition-all transform duration-500 ease-in-out
        `}>
            {message}
        </div>
    )
}