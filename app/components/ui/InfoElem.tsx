export const InfoElem = ({ icon, label, item } : {
    icon: any,
    label: any,
    item: any
}) => {
    return (
        <div className="text-lg flex items-start space-x-2">
            <div className="flex items-center space-x-2">
                {icon}
                <p>{label}:</p>
            </div>
            <p className="select-all">{
                !item ? 
                    'NULL' : 
                    item.length > 15 ?
                        item.substring(0, 15) + '...' :
                        item
                }
            </p>
        </div>
    )
}