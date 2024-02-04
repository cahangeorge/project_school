export const NavigateButton = ({ action_func } : {
    action_func: any
}) => {
    return (
        <button className="border-2 border-white border-dashed p-2.5 rounded-xl shadow absolute top-5 left-5 transition-all ease-in-out duration-300 hover:border-solid hover:scale-105" type="button" onClick={action_func}><i className="ri-arrow-left-line ri-xl"></i></button>
    )
}