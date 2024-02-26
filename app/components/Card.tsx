export const Card = ({ items } : {
    items: any,
    style?: any
}) => {

    return (
        <div className={`flex flex-col justify-between space-y-4
            bg-sky-600/20
            h-auto
            border-2 border-dashed border-white
            backdrop-blur-xl
            shadow-md 
            text-white 
            rounded-xl
            py-7 px-5
            m-1.5
            text-sm
        `}>
            {items}
        </div>
    )
}