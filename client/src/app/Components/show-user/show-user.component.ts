import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { IUser } from '../../../../../interfaces/user';
import { UserService } from 'src/app/Services/user.service';
import { TeamService } from 'src/app/Services/team.service';
import { ITeam } from '../../../../../interfaces/team';

@Component({
  selector: 'app-show-user',
  templateUrl: './show-user.component.html',
  styleUrls: ['./show-user.component.css']
})
export class ShowUserComponent implements OnInit {
  private subscription: Subscription;
  private user: IUser;
  private team: ITeam;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private teamService: TeamService
  ) {
    this.user = null;
    this.team = null;
  }

  ngOnInit() {
    const userID: number = Number(this.route.snapshot.queryParams.id);
    if (isNaN(userID)) {
      this.router.navigate([''], { queryParams: { succ: true, msg: 'Given user does not exist', listing: 'user'}});
      return;
    }
    this.userService.getUser(userID)
    .then((usr: IUser) => {
      this.user = usr;
      if (usr.team !== null) {
        this.teamService.getTeam(this.user.team)
        .then((team: ITeam) => {
          this.team = team;
        })
        .catch();
      }
    })
    .catch(() => {
      this.router.navigate([''], { queryParams: { succ: true, msg: 'Given user does not exist', listing: 'user'}});
    });
  }
}