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
    HitResult = class {
        constructor(party, ch, h) {
            this.party = party;
            this.ch = ch;
            this.h = h;
        }
    }

    constructor(idMode, idResults, idNext, idCHit, idHit) {
        this.idMode = idMode;
        this.idResults = idResults;
        this.idNext = idNext;
        this.idCHit = idCHit
        this.idHit = idHit;

        this.numParty = 5;
        this.jobs = ["戦", "モ", "白", "黒", "赤", "シ", "ナ", "暗", "獣"];
        this.numJobs = 6;
        this.results = new Array();
        this.nextParty = this.makeRandomParty();
    }

    onSwitchNormalMode() {
        document.getElementById(this.idMode).innerHTML = "通常モード";
        this.numJobs = 6;
        this.onReset();
    }

    onSwitchHardMode() {
        document.getElementById(this.idMode).innerHTML = "ハードモード";
        this.numJobs = 9;
        this.onReset();
    }

    onReset() {
        this.nextParty = this.makeRandomParty();
        this.results = new Array();
        this.show();
    }

    onDeleteResult() {
        if (this.results.length <= 0) return;

        const r = this.results.pop();
        this.nextParty = r.party;
        this.show();
    }

    onAddResult() {
        const ch = parseInt(document.getElementById(this.idCHit).value);
        const h = parseInt(document.getElementById(this.idHit).value);
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
        const table = document.getElementById(this.idResults);
        while (table.firstChild)
            table.removeChild(table.firstChild);
        this.appendResults(table);

        const next = document.getElementById(this.idNext);
        next.innerHTML = this.partyToString(this.nextParty);

        const chit = document.getElementById(this.idCHit);
        chit.value = "";
        chit.focus();

        const hit = document.getElementById(this.idHit);
        hit.value = "";
    }

    appendTag(parent, name, text) {
        const tag = document.createElement(name);
        tag.innerHTML = text;
        parent.appendChild(tag);
    }

    appendResults(table) {
        for (let i = 0; i < this.results.length; i++) {
            const r = this.results[i];
            const tr = document.createElement("tr");
            this.appendTag(tr, "td", i + 1);
            this.appendTag(tr, "td", this.partyToString(r.party));
            this.appendTag(tr, "td", r.ch);
            this.appendTag(tr, "td", r.h);
            table.appendChild(tr);
        }
    }

    partyToString(party) {
        let s = "";
        for (var i = 0; i < party.length; i++)
            s += this.jobs[party[i]];
        return s;
    }
}
