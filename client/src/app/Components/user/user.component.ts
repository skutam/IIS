import { Component, OnInit } from '@angular/core';
import { IUser } from '../../../../../interfaces/user';
import { UserService } from 'src/app/Services/user.service';
import { Router } from '@angular/router';
import { RED, GREEN, maxCharLen } from '../../../../../settings/variables';
import { TeamService } from 'src/app/Services/team.service';
import { ITeam } from '../../../../../interfaces/team';
import { IUserStatistics } from '../../../../../interfaces/statistics';
import { StatisticService } from 'src/app/Services/statistic.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  public user: IUser;
  public showMsg: boolean;
  public msg: string;
  public msgColor: string;
  public pass1: string;
  public pass2: string;
  public team: ITeam;
  public userStat: IUserStatistics;

  constructor(
    private userService: UserService,
    private teamService: TeamService,
    private router: Router,
    private statService: StatisticService,
  ) {
    this.showMsg = false;
    this.msg = '';
    this.msgColor = '';

    this.pass1 = '';
    this.pass2 = '';

    this.team = null;
    this.userStat = null;
  }

  ngOnInit() {
    this.user = this.userService.getLoggedData;

    if (this.user === null) {
      this.router.navigate(['user-log_reg'], { queryParams: { succ: false, msg: 'You need to be logged in to change your username.'}});
    }

    this.statService.getUserStatistic(this.user.id)
    .then((us: IUserStatistics) => {
      this.userStat = us;
    })
    .catch(() => {
      this.userStat = null;
    });

    this.getTeamData();
  }

  public updateData(): void {
    let pass = '';

    if (this.pass1 === '' && this.pass2 === '') {
      pass = null;
    }

    if (pass !== null) {
      if (this.pass1 !== this.pass2) {
        this.msg = 'Passwords do not match.';
        this.showMsg = true;
        this.msgColor = RED;
        return;
      }
      pass = this.pass1;
    }

    if (this.user.name === '' ) {
      this.user = this.userService.getLoggedData;
      this.msg = 'Please fill in username.';
      this.showMsg = true;
      this.msgColor = RED;
      return;
    }

    if (this.user.name.length < 1 || this.user.name.length > maxCharLen) {
      this.user = this.userService.getLoggedData;
      this.msg = `Username neesd to be between 1 and ${maxCharLen}`;
      this.showMsg = true;
      this.msgColor = RED;
      return;
    }

    this.userService.updateUser(this.user, pass)
    .then(() => {
      this.router.navigate([''], { queryParams: { succ: true, msg: 'Successfully updated your data.'}});
    })
    .catch(() => {
      this.msg = 'Problem occured while updating data, please try again.';
      this.showMsg = true;
      this.msgColor = RED;
    });
  }

  public closeMessage(): void {
    this.showMsg = false;
  }

  private getTeamData(): void {
    if (this.user.team !== null) {
      this.teamService.getTeam(this.user.team)
      .then((res: ITeam) => {
        this.team = res;
      })
      .catch();
    }
  }

  public leaveTeam(): void {
    if (this.user.team !== null) {
      const usr: IUser = {
        id: this.user.id,
        admin: this.user.admin,
        team: null,
        description: this.user.description,
        name: this.user.name,
        banned: this.user.banned,
      };

      this.userService.updateUser(usr, null)
      .then(() => {
        this.user = this.userService.getLoggedData;
        this.msg = 'You have successfully left the team.';
        this.showMsg = true;
        this.msgColor = GREEN;
      })
      .catch(() => {
        this.msg = 'Problem occured while updating data, please try again.';
        this.showMsg = true;
        this.msgColor = RED;
      });
    }
  }

  public deteleTeam(): void {
    if (this.user.team !== null) {
      this.teamService.deleteTeam(this.user.team)
      .then(() => {
        this.user.team = null;
        this.msg = 'You have successfully removed all users from given team and deleted team.';
        this.showMsg = true;
        this.msgColor = GREEN;
      })
      .catch(() => {
        this.msg = 'There was a problem while deleting team.';
        this.showMsg = true;
        this.msgColor = RED;
      });
    }
  }

  public deleteUser(userID: number): void {
    this.userService.deleteUser(userID)
    .then(() => {
      this.router.navigate([''], { queryParams: { succ: true, msg: 'Successfully removed your account.'}});
    })
    .catch(() => {
      this.msg = 'There was a problem while deleting your account.';
      this.showMsg = true;
      this.msgColor = RED;
    });
  }
}
