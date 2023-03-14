export {Env}

/**
 * Class to read and analyse environment variables.
 */
class Env {
    public static hostname: string
    public static port: number
    public static connectionSecret: string
    public static connectionOfferType: string

    /**
     * Reevaluate all environment variables.
     */
    public static reevaluate(): void {
        Env.hostname = this.getHostname()
        Env.port = this.getPort()
        Env.connectionSecret = this.getConnectionSecret()
        Env.connectionOfferType = this.getConnectionOfferType()
    }

    /**
     * Convert static variables into an object.
     * @returns An object containing all read environment variables.
     */
    public static toObject(): object {
        return {
            hostname: Env.hostname,
            port: Env.port,
            connectionSecret: Env.connectionSecret,
            connectionOfferType: Env.connectionOfferType
        }
    }

    /**
     * Read hostname from environment variables.
     * @returns Hostname.
     */
    static getHostname(): string {
        return getFromEnv('MOSS_HOSTNAME', '0.0.0.0')
    }

    /**
     * Read port number from environment variables.
     * @returns Port number.
     */
    static getPort(): number {
        const env = getFromEnv('MOSS_PORT', '8080')
        return Number(env)
    }

    /**
     * Read connection secret from environment variables.
     * @returns Connection secret.
     */
    static getConnectionSecret(): string {
        return getFromEnv('MOSS_CONNECTION_SECRET')
    }

    /**
     * Read connection offer type from environment variables.
     * @returns Offer type.
     */
    static getConnectionOfferType(): string {
        return getFromEnv('MOSS_CONNECTION_OFFER_TYPE')
    }
}

/**
 * Read a value from environment variables.
 * @param name Name to read from environment variables.
 * @param other Alternative value if variable does not exist.
 * @returns Environment variable or default value.
 */
function getFromEnv(name: string, other?: string): string {
    let env: string | undefined = Bun.env[name]

    if (env === undefined) {
        if (other === undefined) throw Error(`Environment variable '${name}' not set.`)
        return other
    }
    return env
}
