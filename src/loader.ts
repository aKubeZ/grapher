{
    const head: HTMLHeadElement | undefined = document.getElementsByTagName("head")[0];
    const prefix: string = "./js/";
    function loadScript(...urls: string[]) {
        if (!head) return;
        urls.forEach((url) => {
            url = prefix + url;
            const script = document.createElement("script");
            script.type = "module";
            // script.type = "text/javascript";
            script.src = url;
            head.appendChild(script);
        });
    }

    loadScript(
        "main.js",
        "entry.js"
    );
}