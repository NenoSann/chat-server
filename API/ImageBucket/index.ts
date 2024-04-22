import COS from "cos-nodejs-sdk-v5"
import STS from 'qcloud-cos-sts'
export class ImageBucket {
    private static Config = {
        baseKey: '/chat/image/',
        Bucket: 'imagebucket-1322308688',
        Region: 'ap-tokyo'
    }
    private secretId: string;
    private secretKey: string;
    private cos: COS;
    private sts: TempCredentialGenerator;
    constructor(SecretKey: string, SecretId: string) {
        this.secretId = SecretId;
        this.secretKey = SecretKey;
        this.cos = new COS({
            SecretKey, SecretId
        });
        this.sts = new TempCredentialGenerator(SecretKey, SecretKey);
    };
    public async uploadFile(data: Buffer | string, key: string) {
        try {
            const response = this.cos.putObject({
                Bucket: ImageBucket.Config.Bucket,
                Region: ImageBucket.Config.Region,
                StorageClass: 'STANDARD',
                Key: ImageBucket.Config.baseKey + key,
                Body: data
            })
            return (await response).Location;
        } catch (error) {
            throw new Error('fail at uploadFile');
        }
    }
    public getCosPath() {
        return ImageBucket.Config;
    }
}

export class TempCredentialGenerator {
    private config: {
        secretId: string,
        secretKey: string,
        durationSeconds: number,
        bucket: string,
        region: string,
        allowPrefix: string,
        proxy: string,
    };
    private static policy = {
        'version': '2.0',
        'statement': [{
            'action': [
                // 简单上传
                'name/cos:PutObject',
                'name/cos:PostObject',
                // 分片上传
                'name/cos:InitiateMultipartUpload',
                'name/cos:ListMultipartUploads',
                'name/cos:ListParts',
                'name/cos:UploadPart',
                'name/cos:CompleteMultipartUpload',
                // 简单上传和分片，需要以上权限，其他权限列表请看 https://cloud.tencent.com/document/product/436/31923

                // 文本审核任务
                // 开通媒体处理服务
                // 更多数据万象授权可参考：https://cloud.tencent.com/document/product/460/41741
            ],
            'resource': [],
            'effect': 'allow',
            'principal': { 'qcs': ['*'] },
        }],
    }
    constructor(SecretKey: string, SecretId: string) {
        this.config = {
            secretId: SecretId,
            secretKey: SecretKey,
            durationSeconds: 1800,
            bucket: 'imagebucket-1322308688',
            region: 'ap-tokyo',
            allowPrefix: '/chat/image/*',
            proxy: ''
        }
    }
    public async getCredential() {
        try {
            const credential = STS.getCredential({
                ...this.config,
                policy: TempCredentialGenerator.policy
            })
            return credential;
        } catch {
            throw new Error('fail at get temp credential.');
        }
    }
    public getCosPath() {
        return {
            Bucket: this.config.bucket,
            Region: this.config.region
        }
    }
}