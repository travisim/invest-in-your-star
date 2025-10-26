#![no_std]
use soroban_sdk::{contract, contracttype, contractimpl, Env, Address, BytesN};

#[contract]
pub struct LicenseNFT;

#[contractimpl]
impl LicenseNFT {
    pub fn mint(env: Env, to: Address, content_id: u64, license_hash: BytesN<64>, expires_at: u64) {
        // ... (implementation to be added)
    }

    pub fn burn(env: Env, from: Address, content_id: u64) {
        // ... (implementation to be added)
    }

    pub fn info(env: Env, owner: Address, content_id: u64) -> LicenseInfo {
        // ... (implementation to be added)
        LicenseInfo {
            license_hash: BytesN::from_array(&env, &[0; 64]),
            expires_at: 0,
        }
    }
}

#[contracttype]
#[derive(Clone)]
pub struct LicenseInfo {
    pub license_hash: BytesN<64>,
    pub expires_at: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        // ... (tests to be added)
    }
}
