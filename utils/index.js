const CHAIN_IDS = 5;
import { ethers } from "ethers";
export async function isGeorilNetwork() {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();

    if (chainId === CHAIN_IDS) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}
