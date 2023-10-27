export type TimeOut = ReturnType<typeof setTimeout>

export function invokeLater(handler : () => void, delay : number = 0) : TimeOut {
    return setTimeout(handler, delay);
}