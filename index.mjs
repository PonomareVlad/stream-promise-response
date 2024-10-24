export function textStream(
    dataPromise,
    {
        chunk = ' ',
        intervalMilliseconds = 1_000,
        headers = {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    } = {}
) {
    return new Response(
        new ReadableStream({
            start: controller => {
                const encoder = new TextEncoder()
                const streamInterval = setInterval(
                    () => controller.enqueue(encoder.encode(chunk)),
                    intervalMilliseconds
                )
                return dataPromise.catch(console.error).then(data => {
                    clearInterval(streamInterval)
                    if (typeof data === 'string') controller.enqueue(data)
                    else console.error(data)
                    controller.close()
                })
            },
        }),
        { headers }
    )
}

export function jsonStream(
    dataPromise,
    {
        space,
        replacer,
        chunk = ' ',
        intervalMilliseconds = 1_000,
        headers = {
            'Content-Type': 'application/json; charset=utf-8',
        },
    } = {}
) {
    return textStream(
        dataPromise.then(data => JSON.stringify(data, replacer, space)),
        {
            intervalMilliseconds,
            headers,
            chunk,
        }
    )
}

export function jsonStreamCallback(callback, options) {
    return req => jsonStream(callback(req), options)
}
