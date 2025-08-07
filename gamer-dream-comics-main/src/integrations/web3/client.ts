import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// IPFS Configuration
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
});

export interface AnonymousIdentity {
  address: string;
  publicKey: string;
  privateKey: string;
  pseudonym: string;
  reputation: number;
  createdAt: Date;
}

export interface AnonymousMessage {
  id: string;
  content: string;
  senderAddress: string;
  receiverAddress: string;
  timestamp: number;
  encryptedContent: string;
  ipfsHash: string;
  ephemeral: boolean;
  burnAfterRead: boolean;
  expiresAt?: number;
}

export class AnonymousChatClient {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private currentIdentity: AnonymousIdentity | null = null;

  // Initialize Web3 connection
  async connectWallet(): Promise<boolean> {
    try {
      if (typeof window.ethereum !== 'undefined') {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        await this.provider.send('eth_requestAccounts', []);
        this.signer = await this.provider.getSigner();
        return true;
      } else {
        throw new Error('MetaMask not found');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }

  // Generate anonymous identity
  async generateAnonymousIdentity(): Promise<AnonymousIdentity> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    const address = await this.signer.getAddress();
    const pseudonym = this.generatePseudonym();
    
    // Generate encryption key pair (simplified for demo)
    const keyPair = this.generateSimpleKeyPair();
    
    const identity: AnonymousIdentity = {
      address,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      pseudonym,
      reputation: 0,
      createdAt: new Date()
    };

    this.currentIdentity = identity;
    return identity;
  }

  // Generate random pseudonym
  private generatePseudonym(): string {
    const adjectives = ['Mysterious', 'Shadow', 'Phantom', 'Ghost', 'Veiled', 'Hidden', 'Secret', 'Unknown'];
    const nouns = ['Traveler', 'Wanderer', 'Observer', 'Seeker', 'Explorer', 'Voyager', 'Pilgrim', 'Nomad'];
    const numbers = Math.floor(Math.random() * 9999);
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adjective}${noun}#${numbers.toString().padStart(4, '0')}`;
  }

  // Generate simple key pair (placeholder for demo)
  private generateSimpleKeyPair(): { publicKey: string; privateKey: string } {
    return {
      publicKey: `pub_${Math.random().toString(36).substring(2, 15)}`,
      privateKey: `priv_${Math.random().toString(36).substring(2, 15)}`
    };
  }

  // Encrypt message content (simplified for demo)
  async encryptMessage(content: string, receiverPublicKey: string): Promise<string> {
    if (!this.currentIdentity) {
      throw new Error('No anonymous identity');
    }

    // Simple encryption for demo (in real implementation, use proper encryption)
    const encryptedContent = btoa(content + '|' + receiverPublicKey);
    return encryptedContent;
  }

  // Store message on IPFS
  async storeMessageOnIPFS(message: Omit<AnonymousMessage, 'id' | 'ipfsHash'>): Promise<string> {
    const messageData = JSON.stringify(message);
    const result = await ipfs.add(messageData);
    return result.path;
  }

  // Send anonymous message
  async sendAnonymousMessage(
    receiverAddress: string,
    content: string,
    options: {
      ephemeral?: boolean;
      burnAfterRead?: boolean;
      expiresIn?: number; // seconds
    } = {}
  ): Promise<AnonymousMessage> {
    if (!this.currentIdentity) {
      throw new Error('No anonymous identity');
    }

    // Get receiver's public key (in real implementation, this would be fetched from a registry)
    const receiverPublicKey = await this.getReceiverPublicKey(receiverAddress);
    
    // Encrypt message
    const encryptedContent = await this.encryptMessage(content, receiverPublicKey);
    
    // Create message object
    const message: Omit<AnonymousMessage, 'id' | 'ipfsHash'> = {
      content,
      senderAddress: this.currentIdentity.address,
      receiverAddress,
      timestamp: Date.now(),
      encryptedContent,
      ephemeral: options.ephemeral || false,
      burnAfterRead: options.burnAfterRead || false,
      expiresAt: options.expiresIn ? Date.now() + (options.expiresIn * 1000) : undefined
    };

    // Store on IPFS
    const ipfsHash = await this.storeMessageOnIPFS(message);

    // Create final message with ID and IPFS hash
    const finalMessage: AnonymousMessage = {
      ...message,
      id: ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(message) + Date.now())),
      ipfsHash
    };

    // Store message reference on blockchain (optional, for discovery)
    await this.storeMessageReference(finalMessage);

    return finalMessage;
  }

  // Get receiver's public key (placeholder - would be fetched from decentralized registry)
  private async getReceiverPublicKey(receiverAddress: string): Promise<string> {
    // In a real implementation, this would query a decentralized registry
    // For now, return a placeholder
    return 'placeholder_public_key';
  }

  // Store message reference on blockchain for discovery
  private async storeMessageReference(message: AnonymousMessage): Promise<void> {
    // This would store a minimal reference on-chain for message discovery
    // The actual message content stays on IPFS
    console.log('Storing message reference on blockchain:', message.id);
  }

  // Get current anonymous identity
  getCurrentIdentity(): AnonymousIdentity | null {
    return this.currentIdentity;
  }

  // Update pseudonym
  async updatePseudonym(newPseudonym: string): Promise<void> {
    if (!this.currentIdentity) {
      throw new Error('No anonymous identity');
    }
    
    this.currentIdentity.pseudonym = newPseudonym;
    // In real implementation, update on blockchain
  }

  // Get reputation score
  async getReputation(address: string): Promise<number> {
    // In real implementation, this would query the blockchain
    return Math.floor(Math.random() * 100); // Placeholder
  }
}

// Export singleton instance
export const anonymousChatClient = new AnonymousChatClient(); 