import { Component, OnInit } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { Router } from '@angular/router';
import { IUser } from '../../../../../interfaces/user';
import { TeamService } from 'src/app/Services/team.service';
import { RED } from '../../../../../settings/variables';

@Component({
  selector: 'app-add-team',
  templateUrl: './add-team.component.html',
  styleUrls: ['./add-team.component.css']
})
export class AddTeamComponent implements OnInit {
  private showMsg: boolean;
  private msg: string;
  private msgColor: string;

  constructor(
    private router: Router,
    private userService: UserService,
    private teamService: TeamService
  ) {
    this.showMsg = false;
    this.msg = '';
    this.msgColor = '';
  }

  ngOnInit() {
    if (this.userService.getLoggedData === null) {
      return this.router.navigate(['user-log_reg'], { queryParams: { succ: false, msg: 'You need to be logged in to add team.'}});
    }

    const user: IUser = this.userService.getLoggedData;

    if (user.team !== null) {
      return this.router.navigate([''], { queryParams: { succ: false, msg: 'You are already in team, you cannot create a new one.'}});
    }
  }

  public addTeam(teamName: string, file: FileList): void {
    this.showMsg = false;

    if (teamName === '') {
      this.msg = 'Please fill out name of team.';
      this.msgColor = RED;
      this.showMsg = true;
    }

    this.teamService.addTeam(teamName, file)
    .then(() => {
      this.router.navigate([''], { queryParams: { succ: true, msg: 'You have been created team and have been added to it.'}});
    })
    .catch(() => {
      this.msg = 'Team with that name already exist.';
      this.msgColor = RED;
      this.showMsg = true;
    });
  }

  public closeMessage(): void {
    this.showMsg = false;
  }
}
