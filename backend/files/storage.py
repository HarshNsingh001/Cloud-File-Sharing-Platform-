from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from django.conf import settings
from datetime import datetime, timedelta
import os

class AzureBlobStorage:
    def __init__(self):
        self.account_name = settings.AZURE_STORAGE_ACCOUNT_NAME
        self.account_key = settings.AZURE_STORAGE_ACCOUNT_KEY
        self.container_name = settings.AZURE_STORAGE_CONTAINER_NAME
        
        if self.account_name and self.account_key:
            connection_string = f"DefaultEndpointsProtocol=https;AccountName={self.account_name};AccountKey={self.account_key};EndpointSuffix=core.windows.net"
            self.blob_service_client = BlobServiceClient.from_connection_string(connection_string)
            self.container_client = self.blob_service_client.get_container_client(self.container_name)
    
    def upload_file(self, file, blob_name):
        """Upload file to Azure Blob Storage"""
        try:
            blob_client = self.container_client.get_blob_client(blob_name)
            blob_client.upload_blob(file, overwrite=True)
            return True
        except Exception as e:
            print(f"Error uploading file: {e}")
            return False
    
    def download_file(self, blob_name):
        """Download file from Azure Blob Storage"""
        try:
            blob_client = self.container_client.get_blob_client(blob_name)
            return blob_client.download_blob().readall()
        except Exception as e:
            print(f"Error downloading file: {e}")
            return None
    
    def delete_file(self, blob_name):
        """Delete file from Azure Blob Storage"""
        try:
            blob_client = self.container_client.get_blob_client(blob_name)
            blob_client.delete_blob()
            return True
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False
    
    def generate_download_url(self, blob_name, expiry_hours=1):
        """Generate a temporary download URL"""
        try:
            sas_token = generate_blob_sas(
                account_name=self.account_name,
                container_name=self.container_name,
                blob_name=blob_name,
                account_key=self.account_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(hours=expiry_hours)
            )
            url = f"https://{self.account_name}.blob.core.windows.net/{self.container_name}/{blob_name}?{sas_token}"
            return url
        except Exception as e:
            print(f"Error generating URL: {e}")
            return None