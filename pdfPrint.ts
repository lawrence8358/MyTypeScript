/*
    Create By Lawrence 列印PDF，本類別相依jQuery & PDFJs  & PrintJs 
        PrintJs(使用SourceCode直接套用) : http://printjs.crabbly.com/ 
        PDFJs(有修改程式，開啟後直接列印) : https://mozilla.github.io/pdf.js/
            IE，使用Element輸出，先偷用Embed，若Client端沒有安裝在使用Element輸出。
            Chrome，使用Iframe直接輸出。
            Edge，使用Iframe直接輸出。
            FireFox，使用PDFJs。
            Safari，使用PrintJs。
*/
declare const InstallTrigger: any;
declare const opr: any;
declare const printJS: (item: any) => void;
declare const $: any;

class PDFPrint {
    _iframe: HTMLIFrameElement;
    //_embed: HTMLEmbedElement;
    _embed: HTMLObjectElement;
    _markDiv: HTMLElement;
    _debugMode = true;
    _object: HTMLObjectElement;
    _iePrintCount = 0;
    _removeMarkDivTime = 60; //移除Mark Loading時間(秒)
    _elemId: string = null;
    _pdfJsPath = "pdfjs/web/viewer.html?file=";
    //_pdfJsPath = "../js/PdfThirdParty/pdfjs/web/viewer.html?file="; 
    _elementLoadEvent: () => boolean;

    constructor(elemId: string = null) {
        this._elemId = elemId;
    }

    /** 判斷是否為Chrome 1+ */
    get isChrome() {
        return !!(<any>window).chrome && !!(<any>window).chrome.webstore;
    }

    /** 判斷是否為Opera 8.0+ */
    get isOpera() {
        return (!!(<any>window).opr && !!opr.addons) || !!(<any>window).opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    }

    /** Blink engine detection */
    get isBlink() {
        return (this.isChrome || this.isOpera) && !!(<any>window).CSS;
    }

    /** 判斷是否為Internet Explorer 6-11 */
    get isIE() {
        return false || !!(<any>document).documentMode;
    }

    /** 判斷是否為Edge 20+ */
    get isEdge() {
        return !this.isIE && !!(<any>window).StyleMedia;
    }

    /** At least Safari 3+: "[object HTMLElementConstructor]" */
    get isSafari() {
        return Object.prototype.toString.call((<any>window).HTMLElement).indexOf('Constructor') > 0;
    }

    get isFirefox() {
        return typeof InstallTrigger !== 'undefined';
    }

    get isAllNot() {
        return !this.isChrome && !this.isOpera && !this.isBlink &&
            !this.isIE && !this.isEdge && !this.isSafari && !this.isFirefox
    }

    printPdfUrl(url: string, elementLoadEvent: () => boolean = null) { 
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

        let $this = this;
        setTimeout(function () {
            $this.hideLoadingDiv();
        }, $this._removeMarkDivTime * 1000); //超過時間尚未處理完畢，關閉檢視
    }

    private createElement(elemId: string) {
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
    }

    private createIframe(url: string) {
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

    private createIframe2(url: string) {
        this.debug('createIframe2');
        this.showLoadingDiv();
        this.removeIframe();
        if (!this._iframe) this._iframe = document.createElement('iframe');
        this._iframe.src = url;
        this._iframe.id = 'iframePdf';
        this._iframe.width = "0px";
        this._iframe.height = "0px";
        //this._iframe.style.display = 'none'; //<==完全隱藏會有問題，調整成輸出後移除Frame 
        let $this = this;
        this._iframe.onload = function () {
            let frame: any = document.getElementById('iframePdf');
            if (!frame.contentWindow.document.execCommand('print', false, null)) {   //Chrome & Edge
                frame.contentWindow.focus();
                frame.contentWindow.print();
            }

            setTimeout(function () {
                $this.hideLoadingDiv();
            }, 1000);
        }
        document.body.appendChild(this._iframe);
    }

    private createEmbed(url: string) {
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
        if (!this._embed) this._embed = document.createElement('object');
        this._embed.id = 'embedPdf';
        this._embed.data = url;
        this._embed.type = 'application/pdf';
        this._embed.width = '0';
        this._embed.height = '0';
        this._embed.innerHTML = "<embed src='" + url + "'><p  id='embedLabel'></p></embed>";
        document.body.appendChild(this._embed);

        let $this = this;
        setTimeout(function () {
            let isUseObj = !$("#embedLabel").is(':visible');
            console.log(isUseObj);

            if (!isUseObj) { //不能用Embed，使用window.open的方式
                $this.createElement($this._elemId);
            }
            else {
                $this.printEmbedPdf2($this);
            }
        }, 100);
    }

    /**
    * IE列印使用 
    */
    printEmbedPdf2($this) {
        $this.debug('printEmbedPdf2');
        var doc = document.getElementById("embedPdf");

        setTimeout(function () {
            try {
                (<any>doc).print();
                $this._iePrintCount = 0;
                $this.hideLoadingDiv();
            }
            catch (e) {
                if ($this._iePrintCount <= 10) {
                    $this._iePrintCount++;
                    $this.printEmbedPdf2($this);
                }
                else {
                    $this._iePrintCount = 0;
                    $this.hideLoadingDiv();
                }
            }
        }, 5000);
    }

    /**
    * IE列印使用 
    */
    static printEmbedPdf($this, elemId) {
        $this.debug('printEmbedPdf');
        setTimeout(function () {
            var doc = document.getElementById("embedPdf");
            if (typeof (<any>doc).print === undefined || (<any>doc).print === 'undefined') {
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
                console.dir((<any>doc).print);
                $this.debug('doc.print !== undefined');
                try { (<any>doc).print(); } catch (e) { $this.createElement(elemId); }
                $this._iePrintCount = 0;
                $this.hideLoadingDiv();
            }
        }, 2000); //遇到大檔案太快會有問題
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

    private removeEmbed() {
        if (this._embed && this._embed.parentNode) { this.debug('removeEmbed'); document.body.removeChild(this._embed); this._embed = null; }
    }

    hideLoadingDiv() {
        if (this._markDiv && this._markDiv.parentNode) { this.debug('hideLoadingDiv'); document.body.removeChild(this._markDiv); this._markDiv = null; }
        //this.removeIframe();
        //this.removeEmbed(); //這邊如果移除會造成PDF Reader有問題
    }

    private debug(message: any) {
        if (this._debugMode) console.dir(message);
    }
}