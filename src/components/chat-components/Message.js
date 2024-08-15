const Message = ({message, ref}) => {
    return (
        <div
            ref={ref}
            className="flex items-center gap-2 mt-1">
                <div className="w-6 h-6 rounded-full bg-purple-500"></div>
                <p className="bg-slate-300 p-2 rounded-lg">{message}</p>
        </div>
    )
  }
  export default Message