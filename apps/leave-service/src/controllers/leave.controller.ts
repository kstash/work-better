import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { LeaveService } from '../services/leave.service';
import { CreateLeaveDto } from '../dto/create-leave.dto';
import { UpdateLeaveStatusDto } from '../dto/update-leave-status.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('leaves')
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  async requestLeave(@Request() req, @Body() createLeaveDto: CreateLeaveDto) {
    return this.leaveService.requestLeave(createLeaveDto, req.user.sub);
  }

  @Get()
  async getLeaves(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.leaveService.getLeaves(req.user.sub, startDate, endDate);
  }

  @Get('balance')
  async getLeaveBalance(@Request() req) {
    return this.leaveService.getLeaveBalance(req.user.sub);
  }

  @Get(':id')
  async getLeave(@Param('id') id: string) {
    const leaves = await this.leaveService.getLeaves(id);
    if (leaves.length === 0) {
      throw new NotFoundException('휴가 신청을 찾을 수 없습니다.');
    }
    return leaves[0];
  }

  @Put(':id/status')
  async updateLeaveStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateLeaveStatusDto: UpdateLeaveStatusDto,
  ) {
    return this.leaveService.updateLeaveStatus(
      id,
      req.user.sub,
      updateLeaveStatusDto,
    );
  }

  @Put(':id/cancel')
  async cancelLeave(@Request() req, @Param('id') id: string) {
    return this.leaveService.cancelLeave(req.user.sub, id);
  }
}
