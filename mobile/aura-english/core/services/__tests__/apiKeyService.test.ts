import * as SecureStore from 'expo-secure-store';
import { saveApiKey, getApiKey, deleteApiKey, hasApiKey } from '../apiKeyService';
import { saveProviderKey, getProviderKey, deleteProviderKey, hasProviderKey } from '../aiProviderService';

// Mock dependencies
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('../aiProviderService', () => ({
  saveProviderKey: jest.fn(),
  getProviderKey: jest.fn(),
  deleteProviderKey: jest.fn(),
  hasProviderKey: jest.fn(),
}));

describe('apiKeyService', () => {
  const MOCK_API_KEY = 'test_gemini_key_123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveApiKey', () => {
    it('should save API key in both SecureStore and provider store', async () => {
      await saveApiKey(MOCK_API_KEY);
      
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('gemini_api_key', MOCK_API_KEY);
      expect(saveProviderKey).toHaveBeenCalledWith('gemini', MOCK_API_KEY);
    });
  });

  describe('getApiKey', () => {
    it('should return API key from provider store if available', async () => {
      (getProviderKey as jest.Mock).mockResolvedValueOnce(MOCK_API_KEY);
      
      const key = await getApiKey();
      
      expect(key).toBe(MOCK_API_KEY);
      expect(getProviderKey).toHaveBeenCalledWith('gemini');
      expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    });

    it('should fallback to legacy SecureStore if provider store empty', async () => {
      (getProviderKey as jest.Mock).mockResolvedValueOnce(null);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('legacy_key');
      
      const key = await getApiKey();
      
      expect(key).toBe('legacy_key');
      expect(getProviderKey).toHaveBeenCalledWith('gemini');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('gemini_api_key');
    });
  });

  describe('deleteApiKey', () => {
    it('should delete API key from both stores', async () => {
      await deleteApiKey();
      
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('gemini_api_key');
      expect(deleteProviderKey).toHaveBeenCalledWith('gemini');
    });
  });

  describe('hasApiKey', () => {
    it('should return true if provider store has key', async () => {
      (hasProviderKey as jest.Mock).mockResolvedValueOnce(true);
      
      const result = await hasApiKey();
      
      expect(result).toBe(true);
      expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    });

    it('should check SecureStore fallback if provider empty', async () => {
      (hasProviderKey as jest.Mock).mockResolvedValueOnce(false);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('some_key');
      
      const result = await hasApiKey();
      
      expect(result).toBe(true);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('gemini_api_key');
    });
  });
});
