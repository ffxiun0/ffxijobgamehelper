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

var numParty = 5;
var jobs = ["戦", "モ", "白", "黒", "赤", "シ", "ナ", "暗", "獣"];
var numJobs;
var results;
var nextParty;

onSwitchNormalMode();

function onSwitchNormalMode() {
    document.getElementById("mode").innerHTML = "通常モード";
    numJobs = 6;
    onReset();
}

function onSwitchHardMode() {
    document.getElementById("mode").innerHTML = "ハードモード";
    numJobs = 9;
    onReset();
}

function onReset() {
    nextParty = makeRandomParty();
    results = new Array();
    show();
}

function onDeleteResult() {
    if (results.length <= 0) return;

    var r = results.pop();
    nextParty = r.party;
    show();
}

function onAddResult() {
    var ch = parseInt(document.getElementById("chit").value);
    var h = parseInt(document.getElementById("hit").value);
    if (Number.isNaN(ch)) return;
    if (Number.isNaN(h)) return;

    results.push(new HitResult(nextParty, ch, h));
    var next = searchNextParty(results);
    if (next) {
        nextParty = next;
        show();
    } else {
        results.pop();
        alert("次候補が見つかりません。入力に間違いがないか確認して下さい。");
    }
}

function HitResult(party, ch, h) {
    this.party = party;
    this.ch = ch;
    this.h = h;
}

function searchNextParty(results) {
    var p1 = searchNextPartyRandom(results);
    if (p1) return p1;

    var p2 = searchNextPartySequential(results);
    if (p2) return p2;

    return null;
}

function searchNextPartyRandom(results) {
    var all = Math.pow(numJobs, numParty);
    for (var i = 0; i < all; i++) {
        var party = makeRandomParty();
        if (checkCompatible(party, results))
            return party;
    }
    return null;
}

function searchNextPartySequential(results) {
    var all = Math.pow(numJobs, numParty);
    for (var i = 0; i < all; i++) {
        var party = makeSequentialParty(i);
        if (checkCompatible(party, results))
            return party;
    }
    return null;
}

function checkCompatible(party, results) {
    for (var i = 0; i < results.length; i++) {
        var r = results[i];
        var ch = countCriticalHit(party, r.party);
        if (ch != r.ch || ch == numParty) return false;

        var h = countHit(party, r.party) - ch;
        if (h != r.h) return false;
    }
    return true;
}

function countCriticalHit(a, b) {
    var count = 0;
    for (var i = 0; i < numParty; i++) {
        if (a[i] == b[i])
            count++;
    }
    return count;
}

function countHit(a, b) {
    var count = 0;
    var hit = new Array(numParty);
    for (var i = 0; i < numParty; i++) {
        for (var j = 0; j < numParty; j++) {
            if (!hit[j] && a[i] == b[j]) {
                count++;
                hit[j] = true;
                break;
            }
        }
    }
    return count;
}

function makeRandomParty() {
    var all = Math.pow(numJobs, numParty);
    var number = Math.floor(Math.random() * all);
    return makeSequentialParty(number);
}

function makeSequentialParty(number) {
    var p = new Array(numParty);
    for (var i = 0; i < numParty; i++) {
        p[i] = number % numJobs;
        number = Math.floor(number / numJobs);
    }
    return p;
}

function show() {
    var table = document.getElementById("table");
    while (table.firstChild)
        table.removeChild(table.firstChild);
    appendResults(table);
    appendNext(table);

    document.getElementById("chit").focus();
}

function appendTag(parent, name, text) {
    var tag = document.createElement(name);
    tag.innerHTML = text;
    parent.appendChild(tag);
}

function appendResults(table) {
    for (var i = 0; i < results.length; i++) {
        var r = results[i];
        var tr = document.createElement("tr");
        appendTag(tr, "td", i + 1);
        appendTag(tr, "td", partyToString(r.party));
        appendTag(tr, "td", r.ch);
        appendTag(tr, "td", r.h);
        table.appendChild(tr);
    }
}

function appendNext(table) {
    var tr = document.createElement("tr");
    appendTag(tr, "td", "-");
    appendTag(tr, "td", partyToString(nextParty));
    appendTag(tr, "td", '<input id="chit" type="number" min="0" max="5" size="3"/>');
    appendTag(tr, "td", '<input id="hit" type="number" min="0" max="5" size="3"/>');
    appendTag(tr, "td", '<button onclick="onAddResult()">OK</button>');
    appendTag(tr, "td", '<button onclick="onDeleteResult()">削除</button>');
    table.appendChild(tr);
}

function partyToString(party) {
    var s = "";
    for (var i = 0; i < party.length; i++)
        s += jobs[party[i]];
    return s;
}
