
/* =========================================
   PRIME FACTOR CALCULATOR
========================================= */

let lastFactorResult = "";
let lastDivisorResult = "";


/* =========================================
   소인수분해
========================================= */

function factorize() {

    const input = document.getElementById("numberInput");

    const factorResult = document.getElementById("factorResult");
    const stepsResult = document.getElementById("stepsResult");
    const treeResult = document.getElementById("treeResult");
    const primeResult = document.getElementById("primeResult");

    const number = Number(input.value);

    if (
        input.value.trim() === "" ||
        !Number.isSafeInteger(number) ||
        number < 2
    ) {
        factorResult.textContent = "2 이상의 정수를 입력하세요.";
        stepsResult.textContent = "";
        treeResult.textContent = "";
        primeResult.textContent = "";
        lastFactorResult = "";
        return;
    }

    let n = number;
    let factors = [];
    let steps = [];

    for (let i = 2; i <= n / i; i++) {

        while (n % i === 0) {

            let next = n / i;

            factors.push(i);

            steps.push({
                before: n,
                divisor: i,
                after: next
            });

            n = next;
        }
    }

    if (n > 1) {

        factors.push(n);

        steps.push({
            before: n,
            divisor: n,
            after: 1
        });
    }

    let grouped = {};

    factors.forEach(factor => {
        grouped[factor] = (grouped[factor] || 0) + 1;
    });

    let result = Object.entries(grouped)
        .map(([prime, count]) => {
            return count > 1
                ? `${prime}<sup>${count}</sup>`
                : prime;
        })
        .join(" × ");

    lastFactorResult = factors.join(" × ");

    factorResult.innerHTML = `
        <div>${result}</div>

        <button onclick="copyResult()" class="copy-btn">
            결과 복사
        </button>
    `;

    stepsResult.innerHTML = steps.map((step, index) => {

        return `
            <div class="step-item">
                <strong>${index + 1}.</strong>
                ${step.before} ÷ ${step.divisor}
                = <strong>${step.after}</strong>
            </div>
        `;

    }).join("");

    treeResult.innerHTML = buildTree(number);

    if (factors.length === 1 && factors[0] === number) {

        primeResult.innerHTML = `
            <div class="prime-yes">
                <span class="prime-icon">✓</span>
                <h3>소수입니다!</h3>
                <p>
                    ${number}은(는) 1과 자기 자신만을 약수로 갖습니다.
                </p>
            </div>
        `;

    } else {

        primeResult.innerHTML = `
            <div class="prime-no">
                <span class="prime-icon">!</span>
                <h3>합성수입니다!</h3>
                <p>
                    ${number}은(는) 소수들의 곱으로 분해됩니다.
                </p>
                <p>
                    소인수: ${[...new Set(factors)].join(", ")}
                </p>
            </div>
        `;
    }
}


/* =========================================
   소인수분해 트리
========================================= */

function buildTree(number) {

    function createNode(n) {

        let divisor = 0;

        for (let i = 2; i <= n / i; i++) {

            if (n % i === 0) {
                divisor = i;
                break;
            }
        }

        if (divisor === 0) {

            return {
                value: n,
                prime: true,
                left: null,
                right: null
            };
        }

        return {
            value: n,
            prime: false,
            left: createNode(divisor),
            right: createNode(n / divisor)
        };
    }

    const root = createNode(number);

    const nodeWidth = 64;
    const nodeHeight = 42;
    const gapX = 28;
    const gapY = 85;

    let leafIndex = 0;

    const nodes = [];
    const edges = [];

    function layout(node, depth) {

        if (node.prime) {

            node.x = leafIndex * (nodeWidth + gapX) + nodeWidth / 2;

            leafIndex++;

        } else {

            layout(node.left, depth + 1);
            layout(node.right, depth + 1);

            node.x = (node.left.x + node.right.x) / 2;
        }

        node.y = depth * gapY + nodeHeight / 2;

        nodes.push(node);

        if (node.left) {

            edges.push({
                x1: node.x,
                y1: node.y + nodeHeight / 2,
                x2: node.left.x,
                y2: (depth + 1) * gapY
            });

            edges.push({
                x1: node.x,
                y1: node.y + nodeHeight / 2,
                x2: node.right.x,
                y2: (depth + 1) * gapY
            });
        }
    }

    layout(root, 0);

    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x));
    const maxY = Math.max(...nodes.map(n => n.y));

    const padding = 55;

    const width = maxX - minX + padding * 2;
    const height = maxY + nodeHeight / 2 + padding;

    let svg = `
        <svg
            width="${width}"
            height="${height}"
            viewBox="0 0 ${width} ${height}"
            xmlns="http://www.w3.org/2000/svg"
        >
    `;

    edges.forEach((edge, index) => {

        svg += `
            <line
                x1="${edge.x1 - minX + padding}"
                y1="${edge.y1 + 15}"
                x2="${edge.x2 - minX + padding}"
                y2="${edge.y2 + 15}"
                stroke="#60a5fa"
                stroke-width="2"
                stroke-linecap="round"
                style="animation-delay:${index * 0.12}s"
            />
        `;
    });

    nodes.forEach((node, index) => {

        const x = node.x - minX + padding;
        const y = node.y + 15;

        const color = node.prime ? "#14532d" : "#1d4ed8";
        const stroke = node.prime ? "#22c55e" : "#60a5fa";
        const textColor = node.prime ? "#86efac" : "#ffffff";

        svg += `
            <g style="animation-delay:${index * 0.15}s">

                <rect
                    x="${x - nodeWidth / 2}"
                    y="${y - nodeHeight / 2}"
                    width="${nodeWidth}"
                    height="${nodeHeight}"
                    rx="9"
                    fill="${color}"
                    stroke="${stroke}"
                    stroke-width="1.5"
                />

                <text
                    x="${x}"
                    y="${y + 6}"
                    text-anchor="middle"
                    font-size="17"
                    font-weight="bold"
                    fill="${textColor}"
                >
                    ${node.value}
                </text>

            </g>
        `;
    });

    svg += `</svg>`;

    return `<div class="svg-tree">${svg}</div>`;
}


/* =========================================
   소인수분해 결과 복사
========================================= */

function copyResult() {

    if (!lastFactorResult) return;

    copyText(lastFactorResult);
}


/* =========================================
   최대공약수
========================================= */

function calculateGCD(a, b) {

    while (b !== 0) {

        let remainder = a % b;

        a = b;
        b = remainder;
    }

    return a;
}


/* =========================================
   최대공약수 · 최소공배수
========================================= */

function calculateGCDLCM() {

    const inputA = document.getElementById("numA");
    const inputB = document.getElementById("numB");

    const gcdResult = document.getElementById("gcdResult");
    const lcmResult = document.getElementById("lcmResult");

    const a = Number(inputA.value);
    const b = Number(inputB.value);

    if (
        inputA.value.trim() === "" ||
        inputB.value.trim() === "" ||
        !Number.isSafeInteger(a) ||
        !Number.isSafeInteger(b) ||
        a < 1 ||
        b < 1
    ) {

        gcdResult.textContent = "1 이상의 정수를 입력하세요.";
        lcmResult.textContent = "";

        return;
    }

    const gcd = calculateGCD(a, b);
    const lcm = (a / gcd) * b;

    if (!Number.isSafeInteger(lcm)) {

        gcdResult.innerHTML = `
            <div class="math-result">
                <span>최대공약수 (GCD)</span>
                <strong>${gcd}</strong>
            </div>
        `;

        lcmResult.textContent =
            "최소공배수가 안전한 정수 범위를 초과했습니다.";

        return;
    }

    gcdResult.innerHTML = `
        <div class="math-result">
            <span>최대공약수 (GCD)</span>
            <strong>${gcd}</strong>
        </div>
    `;

    lcmResult.innerHTML = `
        <div class="math-result">
            <span>최소공배수 (LCM)</span>
            <strong>${lcm}</strong>
        </div>
    `;
}


/* =========================================
   약수 계산기
========================================= */

function calculateDivisors() {

    const input = document.getElementById("divisorInput");
    const result = document.getElementById("divisorResult");

    const number = Number(input.value);

    if (
        input.value.trim() === "" ||
        !Number.isSafeInteger(number) ||
        number < 1
    ) {

        result.textContent = "1 이상의 정수를 입력하세요.";
        lastDivisorResult = "";

        return;
    }

    let divisors = [];

    for (let i = 1; i <= number / i; i++) {

        if (number % i === 0) {

            divisors.push(i);

            if (i !== number / i) {
                divisors.push(number / i);
            }
        }
    }

    divisors.sort((a, b) => a - b);

    const divisorCount = divisors.length;

    const divisorSum = divisors.reduce(
        (sum, value) => sum + value,
        0
    );

    lastDivisorResult = divisors.join(", ");

    result.innerHTML = `
        <h3>약수 목록</h3>

        <div class="divisor-list">
            ${divisors.map(value => `
                <span class="divisor-item">${value}</span>
            `).join("")}
        </div>

        <div class="divisor-info">
            <span>약수의 개수</span>
            <strong>${divisorCount}개</strong>
        </div>

        <div class="divisor-info">
            <span>약수의 합</span>
            <strong>${divisorSum}</strong>
        </div>

        <button
            class="divisor-copy"
            onclick="copyDivisors()"
        >
            약수 목록 복사
        </button>
    `;
}


/* =========================================
   약수 목록 복사
========================================= */

function copyDivisors() {

    if (!lastDivisorResult) return;

    copyText(lastDivisorResult);
}


/* =========================================
   공통 복사 함수
========================================= */

function copyText(text) {

    if (navigator.clipboard && window.isSecureContext) {

        navigator.clipboard.writeText(text)
            .then(() => {
                alert("복사했습니다!");
            })
            .catch(() => {
                fallbackCopy(text);
            });

    } else {

        fallbackCopy(text);
    }
}

function fallbackCopy(text) {

    const textarea = document.createElement("textarea");

    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.select();

    try {

        const success = document.execCommand("copy");

        alert(
            success
                ? "복사했습니다!"
                : "복사에 실패했습니다."
        );

    } catch (error) {

        alert("복사에 실패했습니다.");

    } finally {

        textarea.remove();
    }
}


/* =========================================
   Enter 키 입력
========================================= */

document.getElementById("numberInput")
    .addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            factorize();
        }
    });

document.getElementById("numA")
    .addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            calculateGCDLCM();
        }
    });

document.getElementById("numB")
    .addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            calculateGCDLCM();
        }
    });

document.getElementById("divisorInput")
    .addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            calculateDivisors();
        }
    });


/* =========================================
   실행 확인
========================================= */

console.log("Prime Factor Calculator Ready!");
