/*
The MIT License (MIT)

Copyright (c) 2012 ffxiun0@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

class FFXIJobGameHelper {
    constructor(idMode, idResults, idNext, idCHit, idHit) {
        this.renderer = new this.Renderer;
        this.idMode = idMode;
        this.idResults = idResults;
        this.idNext = idNext;
        this.idCHit = idCHit
        this.idHit = idHit;

        this.numParty = 5;
        this.numJobs = 6;
        this.results = new Array();
        this.nextParty = this.makeRandomParty();
    }

    setDifficultyNormal() {
        this.renderer.setText(this.idMode, "通常モード");
        this.numJobs = 6;
        this.reset();
    }

    setDifficultyHard() {
        this.renderer.setText(this.idMode, "ハードモード");
        this.numJobs = 9;
        this.reset();
    }

    reset() {
        this.nextParty = this.makeRandomParty();
        this.results = new Array();
        this.show();
    }

    deleteResult() {
        if (this.results.length <= 0) return;

        const r = this.results.pop();
        this.nextParty = r.party;
        this.show();
    }

    addResult() {
        const ch = this.renderer.getInputValueInt(this.idCHit);
        const h = this.renderer.getInputValueInt(this.idHit);
        if (Number.isNaN(ch)) return;
        if (Number.isNaN(h)) return;

        this.results.push(new this.HitResult(this.nextParty, ch, h));
        const next = this.searchNextParty(this.results);
        if (next) {
            this.nextParty = next;
            this.show();
        } else {
            this.results.pop();
            alert("次候補が見つかりません。入力に間違いがないか確認して下さい。");
        }
    }

    searchNextParty(results) {
        const all = Math.pow(this.numJobs, this.numParty);
        const offset = Math.floor(Math.random() * all);
        for (let i = 0; i < all; i++) {
            const number = (offset + i) % all;
            const party = this.makePartyFromSerial(number);
            if (this.checkCompatible(party, results))
                return party;
        }
        return null;
    }

    checkCompatible(party, results) {
        for (let i = 0; i < results.length; i++) {
            const r = results[i];
            const ch = this.countCriticalHit(party, r.party);
            if (ch != r.ch || ch == this.numParty) return false;

            const h = this.countHit(party, r.party) - ch;
            if (h != r.h) return false;
        }
        return true;
    }

    countCriticalHit(a, b) {
        let count = 0;
        for (let i = 0; i < this.numParty; i++) {
            if (a[i] == b[i])
                count++;
        }
        return count;
    }

    countHit(a, b) {
        let count = 0;
        const hit = new Array(this.numParty);
        for (let i = 0; i < this.numParty; i++) {
            for (let j = 0; j < this.numParty; j++) {
                if (!hit[j] && a[i] == b[j]) {
                    count++;
                    hit[j] = true;
                    break;
                }
            }
        }
        return count;
    }

    makeRandomParty() {
        const all = Math.pow(this.numJobs, this.numParty);
        const number = Math.floor(Math.random() * all);
        return this.makePartyFromSerial(number);
    }

    makePartyFromSerial(number) {
        const p = new Array(this.numParty);
        for (let i = 0; i < this.numParty; i++) {
            p[i] = number % this.numJobs;
            number = Math.floor(number / this.numJobs);
        }
        return p;
    }

    show() {
        this.renderer.setResults(this.idResults, this.results);
        this.renderer.setNextParty(this.idNext, this.nextParty);
        this.renderer.resetInput(this.idCHit, true);
        this.renderer.resetInput(this.idHit);
    }

    HitResult = class {
        constructor(party, ch, h) {
            this.party = party;
            this.ch = ch;
            this.h = h;
        }
    }

    Renderer = class {
        setText(id, text) {
            document.getElementById(id).innerText = text;
        }

        getInputValueInt(id) {
            return parseInt(document.getElementById(id).value);
        }

        resetInput(id, isFocused = false) {
            const input = document.getElementById(id);
            input.value = "";
            if (isFocused)
                input.focus();
        }

        setResults(id, results) {
            const tbody = document.getElementById(id);

            while (tbody.firstChild)
                tbody.removeChild(tbody.firstChild);

            if (results.length > 0) {
                for (let i = 0; i < results.length; i++) {
                    const r = results[i];
                    const tr = document.createElement("tr");
                    this.appendElement(tr, "td", i + 1);
                    this.appendElement(tr, "td", this.partyToString(r.party));
                    this.appendElement(tr, "td", r.ch);
                    this.appendElement(tr, "td", r.h);
                    tbody.appendChild(tr);
                }
            } else {
                tbody.appendChild(document.createElement("tr")); // Firefox style rendering bug
            }
        }

        setNextParty(id, party) {
            this.setText(id, this.partyToString(party));
        }

        appendElement(parent, name, text) {
            const elem = document.createElement(name);
            elem.innerText = text;
            parent.appendChild(elem);
        }

        partyToString(party) {
            let s = "";
            for (var i = 0; i < party.length; i++)
                s += this.jobNames[party[i]];
            return s;
        }

        jobNames = ["戦", "モ", "白", "黒", "赤", "シ", "ナ", "暗", "獣"];
    }
}
