import { icons } from "#app/utils/list.values.ts"
import { Icon } from "./Icon.tsx"

export const IdElem = ({ item } : {
    item: any
}) => {
    return (
        <div className="flex item-center">
            <Icon value={icons.hashtag} /> 
            <p className="border-b border-white border-dashed pb-1 select-all">{!item ? 'NULL' : item}</p>
        </div>
    )
}