import emailService from './email-service';
import { emailConst } from '../const/entity-const';

const knownTypes = ['email.delivered', 'email.complained', 'email.bounced', 'email.delivery_delayed', 'email.failed'];

const resendService = {

	async webhooks(c, body) {

		if (!knownTypes.includes(body.type)) {
			console.log(`未匹配的 webhook 类型: ${body.type}`, body);
			return { success: true, message: 'unmatched type, logged only' };
		}

		const params = {
			resendEmailId: body.data.email_id,
			status: emailConst.status.SENT
		}

		if (body.type === 'email.delivered') {
			params.status = emailConst.status.DELIVERED
			params.message = null
		}

		if (body.type === 'email.complained') {
			params.status = emailConst.status.COMPLAINED
			params.message = null
		}

		if (body.type === 'email.bounced') {
			let bounce = body.data.bounce
			bounce = JSON.stringify(bounce);
			params.status = emailConst.status.BOUNCED
			params.message = bounce
		}

		if (body.type === 'email.delivery_delayed') {
			params.status = emailConst.status.DELAYED
			params.message = null
		}

		if (body.type === 'email.failed') {
			params.status = emailConst.status.FAILED
			params.message = body.data.failed.reason
		}

		const emailRow = await emailService.updateEmailStatus(c, params)

		if (!emailRow) {
			console.log(`更新邮件状态记录失败, email_id: ${params.resendEmailId}`, params);
			return { success: false, message: '更新邮件状态记录失败' };
		}

		return { success: true, message: 'ok' };

	}
}

export default resendService
