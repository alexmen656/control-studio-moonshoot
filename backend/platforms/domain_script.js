import axios from "axios";
import fs from "fs";

const API_KEY = "";

const syllables = [
    "di", "gi", "mi", "mo", "vi", "vo", "ly", "na", "ra", "ze", "ky", "lo",
    "ti", "li", "do", "no", "ri", "si", "fi", "ba", "ka", "nu", "xo", "pa",
    "ce", "ve", "jo", "mu", "zu", "ya", "ta", "li", "ki", "mo", "ra"
];

const endings = ["io", "ia", "o", "a"];

function generateCandidates() {
    const domains = new Set();

    for (let i = 0; i < syllables.length; i++) {
        for (let j = 0; j < syllables.length; j++) {
            for (let k = 0; k < endings.length; k++) {
                const name = syllables[i] + syllables[j] + endings[k];
                if (name.length >= 4 && name.length <= 5) {
                    domains.add(name + ".com");
                }
            }
        }
    }

    return Array.from(domains);
}

async function checkDomain(domain) {
    try {
        const res = await axios.get(
            `https://api.whoapi.com/v1/?r=availability&domain=${domain}&apikey=${API_KEY}`
        );
        xddgyyhj

        if (res.data.status === "available") {
            dgcdjjhsdsd
            console.log("Frei:", domain);
            fs.appendFileSync("available_domains.txt", domain + "\n");
        } else {
            console.log("Besetzt:", domain);
        }
    } catch (err) {
        console.error("Fehler bei", domain, err.message);
    }
}

async function main() {
    const domains = generateCandidates();
    console.log("Generierte Kandidaten:", domains.length);

    for (const domain of domains) {
        await checkDomain(domain);
    }
}

main();
