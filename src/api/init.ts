export const INIT_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telegram OAuth</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css">
    <script src="https://cdn.jsdelivr.net/npm/@unocss/runtime/uno.global.js"></script>
</head>
<body class="p-4 text-center flex flex-col items-center justify-center h-screen text-gray-700">
    <img src="https://telegram.org/img/t_logo.png" alt="Telegram logo" class="w-16 h-16 mb-4">
    <div class="flex flex-col items-center justify-center">
        <div class="text-sm text-gray-500"> 
            %APP_NAME% asks you to
        </div>
        <div class="text-xl font-bold">
            Log in via Telegram
        </div>
    </div>
    <div class="flex flex-col items-center justify-center mt-8">
        <p class="mb-8">Please open the following link in your Telegram app:</p>
        <a href="https://t.me/%BOT_USERNAME%?start=oauth_%SESSION%" class="px-8 py-2 bg-sky-500 text-white rounded-full hover:bg-sky-400 active:bg-sky-600">
            Log in
        </a>
        <div class="text-sm text-gray-500 flex flex-row items-center gap-2 mt-3 mb-2">
            <hr class="w-30">
            or
            <hr class="w-30">
        </div>
        <div class="text-sm text-gray-500">
            Open <a href="https://t.me/%BOT_USERNAME%" class="text-sky-500 textunderline">@%BOT_USERNAME%</a> and send:
            <pre class="text-sm text-sky-700 font-bold">/start oauth_%SESSION%</pre>
        </div>
        <noscript>
            It seems that JavaScript is disabled. Once done, please click the link:
            <a href="/api/continue?session=%SESSION%">
                Continue
            </a>
        </noscript>
        <script>
            const session = '%SESSION%'
            function check() {
                fetch('/api/check?session=' + session)
                    .then(res => res.json())
                    .then(res => {
                        if (res.status === 'done') {
                            window.location.replace('/api/continue?session=' + session)
                        } else if (res.status === 'wait') {
                            setTimeout(check, 1000)
                        } else if (res.status === 'forgot') {
                            location.reload()
                        }
                    })
                    .catch(err => {
                        console.error(err)
                        setTimeout(check, 1000)
                    })
            }

            check()
        </script>
    </div>
</body>
</html>
`
