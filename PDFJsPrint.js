var PDFJSPrint = (function () {
    function PDFJSPrint(pdfJsPath) {
        this._debugMode = true;
        this._removeMarkDivTime = 60; //移除Mark Loading時間(秒) 
        this._pdfJsPath = "pdfjs/web/viewer.html?file=";
        if (pdfJsPath)
            this._pdfJsPath = pdfJsPath;
    }
    Object.defineProperty(PDFJSPrint.prototype, "pdfJsPath", {
        set: function (value) {
            this._pdfJsPath = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PDFJSPrint.prototype, "isIE", {
        get: function () {
            return false || !!document.documentMode;
        },
        enumerable: true,
        configurable: true
    });
    PDFJSPrint.prototype.printPdfUrl = function (url) {
        this.debug('printPdfUrl url ' + url);
        this.createIframe(url);
        var $this = this;
        setTimeout(function () {
            $this.hideLoadingDiv();
        }, $this._removeMarkDivTime * 1000); //超過時間尚未處理完畢，關閉檢視
    };
    PDFJSPrint.prototype.createIframe = function (url) {
        console.log(this._pdfJsPath);
        if (this.isIE) {
            window.open(this._pdfJsPath + encodeURIComponent(url), 'PrintWindow', 'height=0,width=0');
        }
        else {
            this.debug('createIframe');
            this.showLoadingDiv();
            this.removeIframe();
            if (!this._iframe)
                this._iframe = document.createElement('iframe');
            this._iframe.src = this._pdfJsPath + encodeURIComponent(url);
            this._iframe.id = 'iframePdf';
            this._iframe.width = "0px";
            this._iframe.height = "0px";
            //this._iframe.style.display = 'none'; //<==完全隱藏會有問題，調整成輸出後移除Frame
            document.body.appendChild(this._iframe);
        }
    };
    PDFJSPrint.prototype.showLoadingDiv = function () {
        this.debug('showLoadingDiv');
        if (this._markDiv && this._markDiv.parentNode) {
            document.body.removeChild(this._markDiv);
            this._markDiv = null;
        }
        if (!this._markDiv)
            this._markDiv = document.createElement('DIV');
        this._markDiv.id = "DivMark";
        var style = "background-color:#999; text-align: center;";
        style += "width:100%; height:100%;";
        style += "position:fixed; top:0; left:0; zindex:1000;";
        style += "filter:alpha(opacity=70); opacity:0.7; zoom:1;-moz-opacity:0.7;";
        this._markDiv.style.cssText = style;
        this._markDiv.innerHTML = "<div style='width:100%;top: 50%;position: absolute;color:blue;font-size:1em;font-family:\"Microsoft JhengHei\"'>PDF 讀取中..</div>";
        document.body.appendChild(this._markDiv);
    };
    PDFJSPrint.prototype.removeIframe = function () {
        if (this._iframe && this._iframe.parentNode) {
            this.debug('removeIframe');
            document.body.removeChild(this._iframe);
            this._iframe = null;
        }
    };
    PDFJSPrint.prototype.hideLoadingDiv = function () {
        if (this._markDiv && this._markDiv.parentNode) {
            this.debug('hideLoadingDiv');
            document.body.removeChild(this._markDiv);
            this._markDiv = null;
        }
        //this.removeIframe(); 
    };
    PDFJSPrint.prototype.debug = function (message) {
        if (this._debugMode)
            console.dir(message);
    };
    return PDFJSPrint;
}());
