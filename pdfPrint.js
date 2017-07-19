var PDFPrint = (function () {
    function PDFPrint(elemId) {
        if (elemId === void 0) { elemId = null; }
        this._debugMode = true;
        this._iePrintCount = 0;
        this._removeMarkDivTime = 60; //移除Mark Loading時間(秒)
        this._elemId = null;
        this._pdfJsPath = "pdfjs/web/viewer.html?file=";
        this._elemId = elemId;
    }
    Object.defineProperty(PDFPrint.prototype, "isChrome", {
        /** 判斷是否為Chrome 1+ */
        get: function () {
            return !!window.chrome && !!window.chrome.webstore;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PDFPrint.prototype, "isOpera", {
        /** 判斷是否為Opera 8.0+ */
        get: function () {
            return (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PDFPrint.prototype, "isBlink", {
        /** Blink engine detection */
        get: function () {
            return (this.isChrome || this.isOpera) && !!window.CSS;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PDFPrint.prototype, "isIE", {
        /** 判斷是否為Internet Explorer 6-11 */
        get: function () {
            return false || !!document.documentMode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PDFPrint.prototype, "isEdge", {
        /** 判斷是否為Edge 20+ */
        get: function () {
            return !this.isIE && !!window.StyleMedia;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PDFPrint.prototype, "isSafari", {
        /** At least Safari 3+: "[object HTMLElementConstructor]" */
        get: function () {
            return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PDFPrint.prototype, "isFirefox", {
        get: function () {
            return typeof InstallTrigger !== 'undefined';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PDFPrint.prototype, "isAllNot", {
        get: function () {
            return !this.isChrome && !this.isOpera && !this.isBlink &&
                !this.isIE && !this.isEdge && !this.isSafari && !this.isFirefox;
        },
        enumerable: true,
        configurable: true
    });
    PDFPrint.prototype.printPdfUrl = function (url, elementLoadEvent) {
        if (elementLoadEvent === void 0) { elementLoadEvent = null; }
        this._elementLoadEvent = elementLoadEvent;
        this.debug('printPdfUrl url ' + url);
        if (this.isIE) {
            this.showLoadingDiv();
            this.createEmbed(url);
        }
        else if (this.isEdge) {
            //this.createIframe(url);
            //this.createElement(this._elemId);
            // this.debug('create printJS');
            // printJS({ printable: url, type: 'pdf' });
            this.createIframe2(url);
        }
        else if (this.isChrome) {
            // this.debug('create printJS');
            // printJS({ printable: url, type: 'pdf' });
            this.createIframe2(url);
        }
        else if (this.isFirefox) {
            this.createIframe(url);
        }
        else if (this.isAllNot) {
            alert('當前瀏覽器不支援列印功能');
        }
        else {
            this.debug('create printJS');
            printJS({ printable: url, type: 'pdf' });
        }
        var $this = this;
        setTimeout(function () {
            $this.hideLoadingDiv();
        }, $this._removeMarkDivTime * 1000); //超過時間尚未處理完畢，關閉檢視
    };
    PDFPrint.prototype.createElement = function (elemId) {
        this.debug('createElement');
        if (elemId) {
            this.debug('elementLoadEvent value : ' + this._elementLoadEvent);
            if (this._elementLoadEvent != null) {
                this._elementLoadEvent();
            }
            var mywindow = window.open('', 'PrintWindow', 'height=0,width=0');
            mywindow.document.write('<html><head><style>*{ margin: 0; padding: 0; }</style></head>');
            mywindow.document.write('<body >');
            mywindow.document.write(document.getElementById(elemId).innerHTML);
            mywindow.document.write('</body></html>');
            mywindow.document.close(); // necessary for IE >= 10
            mywindow.focus(); // necessary for IE >= 10*/
            mywindow.print();
            mywindow.close();
            this.hideLoadingDiv();
        }
    };
    PDFPrint.prototype.createIframe = function (url) {
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
    };
    PDFPrint.prototype.createIframe2 = function (url) {
        this.debug('createIframe2');
        this.showLoadingDiv();
        this.removeIframe();
        if (!this._iframe)
            this._iframe = document.createElement('iframe');
        this._iframe.src = url;
        this._iframe.id = 'iframePdf';
        this._iframe.width = "0px";
        this._iframe.height = "0px";
        //this._iframe.style.display = 'none'; //<==完全隱藏會有問題，調整成輸出後移除Frame 
        var $this = this;
        this._iframe.onload = function () {
            var frame = document.getElementById('iframePdf');
            if (!frame.contentWindow.document.execCommand('print', false, null)) {
                frame.contentWindow.focus();
                frame.contentWindow.print();
            }
            setTimeout(function () {
                $this.hideLoadingDiv();
            }, 1000);
        };
        document.body.appendChild(this._iframe);
    };
    PDFPrint.prototype.createEmbed = function (url) {
        // this.debug('createEmbed');
        // this.removeEmbed();
        // if (!this._embed) this._embed = document.createElement('embed');
        // this._embed.id = 'embedPdf';
        // this._embed.setAttribute('type', 'application/pdf');
        // this._embed.width = '110';
        // this._embed.height = '110';
        // this._embed.src = url;
        // document.body.appendChild(this._embed);
        this.debug('createEmbed');
        this.removeEmbed();
        if (!this._embed)
            this._embed = document.createElement('object');
        this._embed.id = 'embedPdf';
        this._embed.data = url;
        this._embed.type = 'application/pdf';
        this._embed.width = '0';
        this._embed.height = '0';
        this._embed.innerHTML = "<embed src='" + url + "'><p  id='embedLabel'></p></embed>";
        document.body.appendChild(this._embed);
        var $this = this;
        setTimeout(function () {
            var isUseObj = !$("#embedLabel").is(':visible');
            console.log(isUseObj);
            if (!isUseObj) {
                $this.createElement($this._elemId);
            }
            else {
                $this.printEmbedPdf2($this);
            }
        }, 100);
    };
    /**
    * IE列印使用
    */
    PDFPrint.prototype.printEmbedPdf2 = function ($this) {
        $this.debug('printEmbedPdf2');
        var doc = document.getElementById("embedPdf");
        setTimeout(function () {
            try {
                doc.print();
                $this._iePrintCount = 0;
                $this.hideLoadingDiv();
            }
            catch (e) {
                if ($this._iePrintCount <= 10) {
                    $this._iePrintCount++;
                    $this.printEmbedPdf($this);
                }
                else {
                    $this._iePrintCount = 0;
                    $this.hideLoadingDiv();
                }
            }
        }, 5000);
    };
    /**
    * IE列印使用
    */
    PDFPrint.printEmbedPdf = function ($this, elemId) {
        $this.debug('printEmbedPdf');
        setTimeout(function () {
            var doc = document.getElementById("embedPdf");
            if (typeof doc.print === undefined || doc.print === 'undefined') {
                //if ((<any>doc).print === undefined) {
                $this.debug('doc.print === undefined :: ' + $this._iePrintCount);
                if ($this._iePrintCount >= 3) {
                    //如果IE的版本本身就沒有辦法讀取PDF，則另外處理 
                    $this.createElement(elemId);
                    $this.hideLoadingDiv();
                    $this._iePrintCount = 0;
                }
                else {
                    PDFPrint.printEmbedPdf($this, elemId);
                    $this._iePrintCount++;
                }
            }
            else {
                console.dir(doc.print);
                $this.debug('doc.print !== undefined');
                try {
                    doc.print();
                }
                catch (e) {
                    $this.createElement(elemId);
                }
                $this._iePrintCount = 0;
                $this.hideLoadingDiv();
            }
        }, 2000); //遇到大檔案太快會有問題
    };
    PDFPrint.prototype.showLoadingDiv = function () {
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
    PDFPrint.prototype.removeIframe = function () {
        if (this._iframe && this._iframe.parentNode) {
            this.debug('removeIframe');
            document.body.removeChild(this._iframe);
            this._iframe = null;
        }
    };
    PDFPrint.prototype.removeEmbed = function () {
        if (this._embed && this._embed.parentNode) {
            this.debug('removeEmbed');
            document.body.removeChild(this._embed);
            this._embed = null;
        }
    };
    PDFPrint.prototype.hideLoadingDiv = function () {
        if (this._markDiv && this._markDiv.parentNode) {
            this.debug('hideLoadingDiv');
            document.body.removeChild(this._markDiv);
            this._markDiv = null;
        }
        //this.removeIframe();
        //this.removeEmbed(); //這邊如果移除會造成PDF Reader有問題
    };
    PDFPrint.prototype.debug = function (message) {
        if (this._debugMode)
            console.dir(message);
    };
    return PDFPrint;
}());
