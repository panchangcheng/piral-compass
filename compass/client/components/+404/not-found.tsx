import * as React from "react";
import { MainLayout } from "../layout/main-layout";

export class NotFound extends React.Component {
  render() {
    return (
      <MainLayout className="NotFound" contentClass="flex" footer={null}>
        <p className="box center">
          Page not found
        </p>
      </MainLayout>
    )
  }
}