/**
 * Helper to compute SHA-256 hash of a string.
 * Returns a hex string.
 */
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Convert bytes to hex string
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Calculates the matricula based on the current year and the given sequence ID.
 * New Logic:
 * 1. Year (4 digits)
 * 2. Hash = SHA256(Year + Seq + "PMDF@1809")
 * 3. Base36 = Base36(Hash)
 * 4. HashPart = Base36.substring(0, 4).toUpperCase()
 * 5. Result = Year + HashPart + Seq(pad 6)
 * 
 * @param {number|string} id - The sequential ID/Row Number.
 * @returns {Promise<string>} The generated matricula.
 */
export async function generateMatricula(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
        throw new Error(`Invalid ID for matricula generation: ${id}`);
    }

    const year = new Date().getFullYear();
    const seq = numericId.toString().padStart(6, '0');

    // 1. Calculate Hash Input
    const salt = "PMDF@1809";
    const input = `${year}${seq}${salt}`;

    // 2. SHA256
    const hexHash = await sha256(input);

    // 3. Base36 of the hash (treat hex as large number)
    // We use BigInt to handle the 256-bit number
    const bigIntHash = BigInt("0x" + hexHash);
    const base36Full = bigIntHash.toString(36).toUpperCase();

    // 4. Substring(0, 4)
    // Ensure we have enough chars? SHA256 is huge, so yes.
    const hashPart = base36Full.substring(0, 4);

    // 5. Final Assembly
    return `${year}${hashPart}${seq}`;
}

/**
 * Validates if a matricula is correct for a given ID.
 * @param {string} matricula - The matricula to check.
 * @param {number|string} id - The ID to validate against.
 * @returns {Promise<boolean>} True if matricula matches the generated value for the ID.
 */
export async function validateMatricula(matricula, id) {
    try {
        const expected = await generateMatricula(id);
        return matricula === expected;
    } catch (e) {
        return false;
    }
}
