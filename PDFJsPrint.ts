class PDFJSPrint {
    _iframe: HTMLIFrameElement;
    _embed: HTMLObjectElement;
    _markDiv: HTMLElement;
    _debugMode = true;
    _removeMarkDivTime = 60; //移除Mark Loading時間(秒) 
    _pdfJsPath = "pdfjs/web/viewer.html?file=";

    constructor(pdfJsPath?: string) {
        if (pdfJsPath) this._pdfJsPath = pdfJsPath;
    }

    set pdfJsPath(value: string) {
        this._pdfJsPath = value;
    }

    get isIE() {
        return false || !!(<any>document).documentMode;
    }

    printPdfUrl(url: string) {
        this.debug('printPdfUrl url ' + url);
        this.createIframe(url);

        let $this = this;
        setTimeout(function () {
            $this.hideLoadingDiv();
        }, $this._removeMarkDivTime * 1000); //超過時間尚未處理完畢，關閉檢視
    }

    private createIframe(url: string) {
        console.log(this._pdfJsPath);
        if (this.isIE) {
            window.open(this._pdfJsPath + encodeURIComponent(url), 'PrintWindow', 'height=0,width=0');
        }
        else {
            this.debug('createIframe');
            this.showLoadingDiv();
            this.removeIframe();
            if (!this._iframe) this._iframe = document.createElement('iframe');
            this._iframe.src = this._pdfJsPath + encodeURIComponent(url);
            this._iframe.id = 'iframePdf';
            this._iframe.width = "0px";
            this._iframe.height = "0px";
            //this._iframe.style.display = 'none'; //<==完全隱藏會有問題，調整成輸出後移除Frame
            document.body.appendChild(this._iframe);
        }
    }

    showLoadingDiv() {
        this.debug('showLoadingDiv');
        if (this._markDiv && this._markDiv.parentNode) { document.body.removeChild(this._markDiv); this._markDiv = null; }
        if (!this._markDiv) this._markDiv = document.createElement('DIV');
        this._markDiv.id = "DivMark";
        var style = "background-color:#999; text-align: center;";
        style += "width:100%; height:100%;";
        style += "position:fixed; top:0; left:0; zindex:1000;";
        style += "filter:alpha(opacity=70); opacity:0.7; zoom:1;-moz-opacity:0.7;";
        this._markDiv.style.cssText = style;
        this._markDiv.innerHTML = "<div style='width:100%;top: 50%;position: absolute;color:blue;font-size:1em;font-family:\"Microsoft JhengHei\"'>PDF 讀取中..</div>";
        document.body.appendChild(this._markDiv);
    }

    private removeIframe() {
        if (this._iframe && this._iframe.parentNode) { this.debug('removeIframe'); document.body.removeChild(this._iframe); this._iframe = null; }
    }


    hideLoadingDiv() {
        if (this._markDiv && this._markDiv.parentNode) { this.debug('hideLoadingDiv'); document.body.removeChild(this._markDiv); this._markDiv = null; }
        //this.removeIframe(); 
    }

    private debug(message: any) {
        if (this._debugMode) console.dir(message);
    }
}