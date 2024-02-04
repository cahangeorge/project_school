export const Container = ({ children } : {
    children: any
}) => {
    return (
        <div className="flex flex-col items-center justify-start h-auto min-h-[100vh] bg-auth bg-cover">
            <div className="fixed w-full -top-10 h-[110vh] bg-sky-600/20"></div>
            <div className="container py-20">
                {children}
            </div>
        </div>
    )
}