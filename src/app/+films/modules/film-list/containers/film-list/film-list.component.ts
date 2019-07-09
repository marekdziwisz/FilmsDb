import { Component, OnInit } from '@angular/core';
import { sortBy, Sort } from 'src/app/+films/types/film.types';
import { FilmsFacadeService } from 'src/app/+films/services/films-facade.service';
import { Films } from 'src/app/shared/models/Films.models';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-film-list',
  templateUrl: './film-list.component.html',
  styleUrls: ['./film-list.component.scss']
})
export class FilmListComponent implements OnInit {
  sortedBy: Sort;
  currentPage: number;
  numberOfPages: number;
  itemsPerPage: number;
  films: Films;
  page: number;
  isLoading: boolean;

  constructor(
    private facade: FilmsFacadeService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.facade.getSorter().subscribe(val => (this.sortedBy = val));
    this.facade.loadFilms();
    this.facade.getFilmsInfo().subscribe(filmInfo => {
      const numberOfPages = Math.ceil(
        filmInfo.totalFilms / this.facade.getLimit()
      );

      this.itemsPerPage = this.facade.getLimit();
      this.numberOfPages = numberOfPages;
      this.currentPage = this.facade.getPage();
      this.films = filmInfo.films;
      this.isLoading = false;
    });

    this.route.paramMap.subscribe((params: ParamMap) => {
      if (!!params.get('page')) {
        this.setPage(+params.get('page'));
      }
    });
  }

  sortBy(what: sortBy) {
    this.facade.setSorting(what);
    this.isLoading = true;
  }

  setItemsPerPage(items: number) {
    this.facade.setLimit(items);
    this.isLoading = true;
  }

  setPage(page: number) {
    this.facade.setPage(page);
    this.isLoading = true;
  }
}